import { describe, expect, it } from "vitest";

import {
  RESPONDENT_ID,
  addAdult,
  createInitialDraft,
  prefillPartyContactFromAdults,
  removeAdult,
  updateAdult
} from "./rsvpDraft";
import { createInitialRsvpState, rsvpPrototypeReducer } from "./rsvpState";

describe("RSVP draft", () => {
  it("starts with the respondent as the first adult", () => {
    expect(createInitialDraft()).toEqual({
      guestSide: null,
      adults: [
        {
          id: RESPONDENT_ID,
          name: "",
          contact: { email: "", phone: "" },
          attendance: null
        }
      ],
      childrenAttending: 0,
      contact: { email: "", phone: "" },
      dietaryOrAllergyNotes: "",
      accessibilityNotes: "",
      generalNote: ""
    });
  });

  it("adds and removes additional adults without removing the respondent", () => {
    const initial = createInitialDraft();
    const withTwoAdults = addAdult(initial);
    const withThreeAdults = addAdult(withTwoAdults);

    expect(withThreeAdults.adults.map((adult) => adult.id)).toEqual([
      "adult-1",
      "adult-2",
      "adult-3"
    ]);
    expect(removeAdult(withThreeAdults, RESPONDENT_ID)).toBe(withThreeAdults);
    expect(
      removeAdult(withThreeAdults, "adult-2").adults.map((adult) => adult.id)
    ).toEqual(["adult-1", "adult-3"]);
    expect(
      addAdult(removeAdult(withThreeAdults, "adult-2")).adults.at(-1)?.id
    ).toBe("adult-4");
  });

  it("updates each adult independently", () => {
    const withAdditionalAdult = addAdult(createInitialDraft());
    const respondentUpdated = updateAdult(
      withAdditionalAdult,
      RESPONDENT_ID,
      (adult) => ({ ...adult, name: "Alex Example", attendance: "attending" })
    );
    const bothUpdated = updateAdult(respondentUpdated, "adult-2", (adult) => ({
      ...adult,
      name: "Sam Example",
      attendance: "not-sure"
    }));

    expect(bothUpdated.adults).toEqual([
      {
        id: "adult-1",
        name: "Alex Example",
        contact: { email: "", phone: "" },
        attendance: "attending"
      },
      {
        id: "adult-2",
        name: "Sam Example",
        contact: { email: "", phone: "" },
        attendance: "not-sure"
      }
    ]);
  });

  it("prefills each party contact from the first matching adult without overwriting edits", () => {
    let draft = addAdult(createInitialDraft());
    draft = updateAdult(draft, "adult-1", (adult) => ({
      ...adult,
      contact: { email: "", phone: "+1 (415) 555-0123" }
    }));
    draft = updateAdult(draft, "adult-2", (adult) => ({
      ...adult,
      contact: { email: "sam@example.test", phone: "+1 (510) 555-0199" }
    }));

    const prefilled = prefillPartyContactFromAdults(draft);
    expect(prefilled.contact).toEqual({
      email: "sam@example.test",
      phone: "+1 (415) 555-0123"
    });

    expect(
      prefillPartyContactFromAdults({
        ...prefilled,
        contact: { email: "edited@example.test", phone: "555-777-1234" }
      }).contact
    ).toEqual({
      email: "edited@example.test",
      phone: "555-777-1234"
    });
  });
});

describe("rsvpPrototypeReducer", () => {
  it("starts at attendance and supports the form back-transition chain", () => {
    let state = createInitialRsvpState();
    expect(state.currentStage).toBe("attendance");

    state = rsvpPrototypeReducer(state, { type: "go-to", stage: "details" });
    state = rsvpPrototypeReducer(state, { type: "go-to", stage: "review" });
    state = rsvpPrototypeReducer(state, { type: "back" });
    expect(state.currentStage).toBe("details");
    state = rsvpPrototypeReducer(state, { type: "back" });
    expect(state.currentStage).toBe("attendance");
    state = rsvpPrototypeReducer(state, { type: "back" });
    expect(state.currentStage).toBe("attendance");
  });

  it("replaces the draft with an independent copy and resets cleanly", () => {
    const initial = createInitialRsvpState();
    const draft = addAdult(createInitialDraft());
    const replaced = rsvpPrototypeReducer(initial, {
      type: "replace-draft",
      draft
    });

    expect(replaced.draft).toEqual(draft);
    expect(replaced.draft).not.toBe(draft);
    expect(replaced.draft.adults).not.toBe(draft.adults);
    expect(replaced.draft.adults[0]?.contact).not.toBe(
      draft.adults[0]?.contact
    );
    expect(replaced.draft.contact).not.toBe(draft.contact);
    expect(rsvpPrototypeReducer(replaced, { type: "reset" })).toEqual(initial);
  });
});
