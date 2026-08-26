import { useEffect, useReducer, useRef, useState } from "react";

import { createInitialDraft } from "./rsvpDraft";
import { submitRsvp, type SubmitRsvpOptions } from "./rsvpApi";
import { prototypeStorage, type PrototypeStorage } from "./prototypeStorage";
import {
  mapDraftToRsvpSubmission,
  resolveUnresolvedRsvpAttempt
} from "./rsvpSubmission";
import type {
  RsvpActiveState,
  RsvpDraft,
  RsvpFormStage,
  RsvpPrototypeState,
  RsvpSubmissionStatus,
  UnresolvedRsvpAttemptV1
} from "./rsvpTypes";

type RsvpPrototypeAction =
  | { stage: RsvpFormStage; type: "go-to" }
  | { type: "back" }
  | { draft: RsvpDraft; type: "replace-draft" }
  | { submittedDraft: RsvpDraft; type: "submission-accepted" }
  | { type: "reset" };

type ResolveAttempt = typeof resolveUnresolvedRsvpAttempt;
type SubmitRequest = (
  options: SubmitRsvpOptions
) => ReturnType<typeof submitRsvp>;

type UseRsvpPrototypeOptions = {
  apiBaseUrl: string;
  resolveAttempt?: ResolveAttempt;
  storage?: PrototypeStorage;
  submitRequest?: SubmitRequest;
};

const previousStages: Record<RsvpFormStage, RsvpFormStage> = {
  attendance: "attendance",
  details: "attendance",
  review: "details"
};

function cloneDraft(draft: RsvpDraft): RsvpDraft {
  return {
    ...draft,
    adults: draft.adults.map((adult) => ({
      ...adult,
      contact: { ...adult.contact }
    })),
    contact: { ...draft.contact }
  };
}

function createInitialRsvpState(): RsvpActiveState {
  return {
    currentStage: "attendance",
    draft: createInitialDraft(),
    submittedDraft: null
  };
}

function isCleanRsvpState(state: RsvpPrototypeState): boolean {
  return JSON.stringify(state) === JSON.stringify(createInitialRsvpState());
}

function rsvpPrototypeReducer(
  state: RsvpPrototypeState,
  action: RsvpPrototypeAction
): RsvpPrototypeState {
  switch (action.type) {
    case "go-to":
      return state.currentStage === "confirmation"
        ? state
        : { ...state, currentStage: action.stage };
    case "back":
      return state.currentStage === "confirmation"
        ? state
        : { ...state, currentStage: previousStages[state.currentStage] };
    case "replace-draft":
      return state.currentStage === "confirmation"
        ? state
        : { ...state, draft: cloneDraft(action.draft) };
    case "submission-accepted":
      if (state.currentStage === "confirmation") {
        return state;
      }

      return {
        currentStage: "confirmation",
        draft: createInitialDraft(),
        submittedDraft: cloneDraft(action.submittedDraft)
      };
    case "reset":
      return createInitialRsvpState();
  }
}

function useRsvpPrototype({
  apiBaseUrl,
  resolveAttempt = resolveUnresolvedRsvpAttempt,
  storage = prototypeStorage,
  submitRequest = submitRsvp
}: UseRsvpPrototypeOptions) {
  const [restoredSession] = useState(() => storage.read());
  const [state, dispatch] = useReducer(
    rsvpPrototypeReducer,
    restoredSession?.state ?? createInitialRsvpState()
  );
  const [submissionStatus, setSubmissionStatus] =
    useState<RsvpSubmissionStatus>({ state: "idle" });
  const unresolvedAttemptRef = useRef<UnresolvedRsvpAttemptV1 | null>(
    restoredSession?.unresolvedAttempt ?? null
  );
  const submissionInFlightRef = useRef(false);

  useEffect(() => {
    if (state.currentStage === "confirmation" || isCleanRsvpState(state)) {
      storage.reset();
    } else {
      storage.write({
        state,
        unresolvedAttempt: unresolvedAttemptRef.current
      });
    }
  }, [state, storage]);

  function clearAttempt(activeState: RsvpActiveState): void {
    unresolvedAttemptRef.current = null;
    storage.write({ state: activeState, unresolvedAttempt: null });
  }

  async function submit(): Promise<void> {
    if (
      submissionInFlightRef.current ||
      state.currentStage === "confirmation"
    ) {
      return;
    }

    submissionInFlightRef.current = true;
    setSubmissionStatus({ state: "submitting" });

    try {
      let request;
      try {
        request = mapDraftToRsvpSubmission(state.draft);
      } catch {
        clearAttempt(state);
        setSubmissionStatus({ reason: "answers", state: "request-error" });
        return;
      }

      let attempt: UnresolvedRsvpAttemptV1;
      try {
        attempt = await resolveAttempt(request, unresolvedAttemptRef.current);
      } catch {
        setSubmissionStatus({ reason: "preparation", state: "request-error" });
        return;
      }

      const attemptWasPersisted = storage.write({
        state,
        unresolvedAttempt: attempt
      });
      if (!attemptWasPersisted) {
        setSubmissionStatus({ reason: "preparation", state: "request-error" });
        return;
      }
      unresolvedAttemptRef.current = attempt;

      const result = await submitRequest({
        apiBaseUrl,
        idempotencyKey: attempt.idempotencyKey,
        request
      });

      if (result.ok) {
        unresolvedAttemptRef.current = null;
        storage.reset();
        setSubmissionStatus({ state: "idle" });
        dispatch({
          type: "submission-accepted",
          submittedDraft: state.draft
        });
        return;
      }

      if (result.kind === "conflict") {
        clearAttempt(state);
        setSubmissionStatus({ state: "conflict" });
        return;
      }

      if (result.kind === "request" || result.kind === "unexpected") {
        clearAttempt(state);
        setSubmissionStatus({ reason: "answers", state: "request-error" });
        return;
      }

      setSubmissionStatus({
        reason: result.kind === "throttled" ? "busy" : "response-unconfirmed",
        state: "retryable"
      });
    } catch {
      setSubmissionStatus({
        reason: "response-unconfirmed",
        state: "retryable"
      });
    } finally {
      submissionInFlightRef.current = false;
    }
  }

  return {
    state,
    submissionStatus,
    goTo: (stage: RsvpFormStage) => {
      if (!submissionInFlightRef.current) {
        setSubmissionStatus({ state: "idle" });
        dispatch({ type: "go-to", stage });
      }
    },
    back: () => {
      if (!submissionInFlightRef.current) {
        setSubmissionStatus({ state: "idle" });
        dispatch({ type: "back" });
      }
    },
    replaceDraft: (draft: RsvpDraft) => {
      if (!submissionInFlightRef.current) {
        setSubmissionStatus({ state: "idle" });
        dispatch({ type: "replace-draft", draft });
      }
    },
    submit,
    reset: () => {
      if (!submissionInFlightRef.current) {
        unresolvedAttemptRef.current = null;
        storage.reset();
        setSubmissionStatus({ state: "idle" });
        dispatch({ type: "reset" });
      }
    }
  };
}

export {
  cloneDraft,
  createInitialRsvpState,
  isCleanRsvpState,
  rsvpPrototypeReducer,
  useRsvpPrototype,
  type RsvpPrototypeAction,
  type UseRsvpPrototypeOptions
};
