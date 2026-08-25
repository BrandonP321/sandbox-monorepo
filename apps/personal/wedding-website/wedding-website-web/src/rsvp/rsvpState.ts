import { useEffect, useReducer } from "react";

import { createInitialDraft } from "./rsvpDraft";
import { prototypeStorage, type PrototypeStorage } from "./prototypeStorage";
import type {
  RsvpActiveState,
  RsvpDraft,
  RsvpFormStage,
  RsvpPrototypeState
} from "./rsvpTypes";

type RsvpPrototypeAction =
  | { stage: RsvpFormStage; type: "go-to" }
  | { type: "back" }
  | { draft: RsvpDraft; type: "replace-draft" }
  | { type: "submit" }
  | { type: "reset" };

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
    case "submit":
      if (state.currentStage === "confirmation") {
        return state;
      }

      return {
        currentStage: "confirmation",
        draft: createInitialDraft(),
        submittedDraft: cloneDraft(state.draft)
      };
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
    if (state.currentStage === "confirmation" || isCleanRsvpState(state)) {
      storage.reset();
    } else {
      storage.write(state);
    }
  }, [state, storage]);

  return {
    state,
    goTo: (stage: RsvpFormStage) => dispatch({ type: "go-to", stage }),
    back: () => dispatch({ type: "back" }),
    replaceDraft: (draft: RsvpDraft) =>
      dispatch({ type: "replace-draft", draft }),
    submit: () => dispatch({ type: "submit" }),
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
