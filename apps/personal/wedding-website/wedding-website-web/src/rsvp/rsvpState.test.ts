import { describe, expect, it } from "vitest";

import { createDraftForFixture, prototypeFixtures } from "./prototypeFixtures";
import { createInitialRsvpState, rsvpPrototypeReducer } from "./rsvpState";

describe("prototype fixtures", () => {
  it("covers couple, plus-one, and child-count scenarios with fictional data", () => {
    expect(prototypeFixtures.map((fixture) => fixture.id)).toEqual([
      "couple",
      "single-plus-one",
      "family"
    ]);
    expect(
      prototypeFixtures
        .flatMap((fixture) => fixture.invitees)
        .filter((invitee) => invitee.plusOneEligible)
    ).toHaveLength(1);
    expect(
      prototypeFixtures.filter((fixture) => fixture.supportsChildCount)
    ).toHaveLength(1);
    expect(JSON.stringify(prototypeFixtures)).not.toMatch(/@|555|phone/i);
  });
});

describe("rsvpPrototypeReducer", () => {
  it("enters the RSVP and supports the complete back-transition chain", () => {
    let state = rsvpPrototypeReducer(createInitialRsvpState(), {
      type: "start"
    });
    expect(state.currentStage).toBe("attendance");

    state = rsvpPrototypeReducer(state, { type: "go-to", stage: "details" });
    state = rsvpPrototypeReducer(state, { type: "go-to", stage: "review" });
    state = rsvpPrototypeReducer(state, { type: "back" });
    expect(state.currentStage).toBe("details");
    state = rsvpPrototypeReducer(state, { type: "back" });
    expect(state.currentStage).toBe("attendance");
    state = rsvpPrototypeReducer(state, { type: "back" });
    expect(state.currentStage).toBe("landing");
  });

  it("switches fixtures with a clean matching draft", () => {
    const state = rsvpPrototypeReducer(createInitialRsvpState(), {
      type: "select-fixture",
      fixtureId: "family"
    });

    expect(state).toMatchObject({
      currentStage: "attendance",
      selectedFixtureId: "family",
      savedResponse: null,
      draft: { householdId: "family", childCount: 0 }
    });
  });

  it("saves and reopens an independent copy of the response for editing", () => {
    const initial = {
      ...createInitialRsvpState(),
      draft: {
        ...createDraftForFixture("couple"),
        contact: { email: "fictional@example.test", phone: "555-0100" }
      }
    };
    const saved = rsvpPrototypeReducer(initial, { type: "save-draft" });

    expect(saved.currentStage).toBe("confirmation");
    expect(saved.savedResponse).toEqual(initial.draft);
    expect(saved.savedResponse).not.toBe(initial.draft);

    const edited = rsvpPrototypeReducer(saved, { type: "edit-saved" });
    expect(edited.currentStage).toBe("attendance");
    expect(edited.draft).toEqual(saved.savedResponse);
    expect(edited.draft).not.toBe(saved.savedResponse);
  });

  it("ignores a draft for a different selected household and resets cleanly", () => {
    const initial = createInitialRsvpState();
    const mismatched = rsvpPrototypeReducer(initial, {
      type: "replace-draft",
      draft: createDraftForFixture("family")
    });
    expect(mismatched).toBe(initial);

    const started = rsvpPrototypeReducer(initial, { type: "start" });
    expect(rsvpPrototypeReducer(started, { type: "reset" })).toEqual(initial);
  });
});
