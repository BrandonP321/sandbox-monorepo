import { useEffect, useReducer } from "react";

import { createInitialDraft } from "./rsvpDraft";
import { prototypeStorage, type PrototypeStorage } from "./prototypeStorage";
import type { RsvpDraft, RsvpPrototypeState, RsvpStage } from "./rsvpTypes";

type RsvpPrototypeAction =
  | { type: "start" }
  | { stage: RsvpStage; type: "go-to" }
  | { type: "back" }
  | { draft: RsvpDraft; type: "replace-draft" }
  | { type: "reset" };

const previousStages: Record<RsvpStage, RsvpStage> = {
  landing: "landing",
  attendance: "landing",
  details: "attendance",
  review: "details",
  confirmation: "review"
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

function createInitialRsvpState(): RsvpPrototypeState {
  return { currentStage: "landing", draft: createInitialDraft() };
}

function isCleanRsvpState(state: RsvpPrototypeState): boolean {
  return JSON.stringify(state) === JSON.stringify(createInitialRsvpState());
}

function rsvpPrototypeReducer(
  state: RsvpPrototypeState,
  action: RsvpPrototypeAction
): RsvpPrototypeState {
  switch (action.type) {
    case "start":
      return { ...state, currentStage: "attendance" };
    case "go-to":
      return { ...state, currentStage: action.stage };
    case "back":
      return { ...state, currentStage: previousStages[state.currentStage] };
    case "replace-draft":
      return { ...state, draft: cloneDraft(action.draft) };
    case "reset":
      return createInitialRsvpState();
  }
}

function useRsvpPrototype(storage: PrototypeStorage = prototypeStorage) {
  const [state, dispatch] = useReducer(
    rsvpPrototypeReducer,
    undefined,
    () => storage.read() ?? createInitialRsvpState()
  );

  useEffect(() => {
    if (isCleanRsvpState(state)) {
      storage.reset();
    } else {
      storage.write(state);
    }
  }, [state, storage]);

  return {
    state,
    start: () => dispatch({ type: "start" }),
    goTo: (stage: RsvpStage) => dispatch({ type: "go-to", stage }),
    back: () => dispatch({ type: "back" }),
    replaceDraft: (draft: RsvpDraft) =>
      dispatch({ type: "replace-draft", draft }),
    reset: () => dispatch({ type: "reset" })
  };
}

export {
  cloneDraft,
  createInitialRsvpState,
  isCleanRsvpState,
  rsvpPrototypeReducer,
  useRsvpPrototype,
  type RsvpPrototypeAction
};
