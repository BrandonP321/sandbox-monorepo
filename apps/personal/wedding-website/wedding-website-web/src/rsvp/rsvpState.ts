import { useEffect, useReducer } from "react";

import { DEFAULT_FIXTURE_ID, createDraftForFixture } from "./prototypeFixtures";
import { prototypeStorage, type PrototypeStorage } from "./prototypeStorage";
import type {
  FixtureId,
  RsvpDraft,
  RsvpPrototypeState,
  RsvpStage
} from "./rsvpTypes";

type RsvpPrototypeAction =
  | { type: "start" }
  | { stage: RsvpStage; type: "go-to" }
  | { type: "back" }
  | { fixtureId: FixtureId; type: "select-fixture" }
  | { draft: RsvpDraft; type: "replace-draft" }
  | { type: "save-draft" }
  | { type: "edit-saved" }
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
    inviteeResponses: draft.inviteeResponses.map((response) => ({
      ...response,
      plusOne: response.plusOne ? { ...response.plusOne } : null
    })),
    contact: { ...draft.contact }
  };
}

function createInitialRsvpState(): RsvpPrototypeState {
  return {
    currentStage: "landing",
    selectedFixtureId: DEFAULT_FIXTURE_ID,
    draft: createDraftForFixture(DEFAULT_FIXTURE_ID),
    savedResponse: null
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
    case "start":
      return { ...state, currentStage: "attendance" };
    case "go-to":
      return { ...state, currentStage: action.stage };
    case "back":
      return { ...state, currentStage: previousStages[state.currentStage] };
    case "select-fixture":
      return {
        currentStage: "attendance",
        selectedFixtureId: action.fixtureId,
        draft: createDraftForFixture(action.fixtureId),
        savedResponse: null
      };
    case "replace-draft":
      if (action.draft.householdId !== state.selectedFixtureId) {
        return state;
      }
      return { ...state, draft: cloneDraft(action.draft) };
    case "save-draft":
      return {
        ...state,
        currentStage: "confirmation",
        savedResponse: cloneDraft(state.draft)
      };
    case "edit-saved":
      return state.savedResponse
        ? {
            ...state,
            currentStage: "attendance",
            draft: cloneDraft(state.savedResponse)
          }
        : state;
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
    selectFixture: (fixtureId: FixtureId) =>
      dispatch({ type: "select-fixture", fixtureId }),
    replaceDraft: (draft: RsvpDraft) =>
      dispatch({ type: "replace-draft", draft }),
    saveDraft: () => dispatch({ type: "save-draft" }),
    editSaved: () => dispatch({ type: "edit-saved" }),
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
