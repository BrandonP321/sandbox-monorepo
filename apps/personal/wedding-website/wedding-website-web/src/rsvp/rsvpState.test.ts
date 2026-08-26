import { describe, expect, it } from "vitest";

import {
  RESPONDENT_ID,
  addAdult,
  createInitialDraft,
  getAttendingCount,
  prefillPartyContactFromAdults,
  removeAdult,
  updateAdult
} from "./rsvpDraft";
import {
  cloneDraft,
  createInitialRsvpState,
  rsvpPrototypeReducer
} from "./rsvpState";
import type { RsvpPrototypeState } from "./rsvpTypes";

describe("RSVP draft", () => {
  it("starts with blank contact fields on the first adult", () => {
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

  it("updates adults independently and counts only attending adults plus children", () => {
    const withAdditionalAdult = addAdult(createInitialDraft());
    const respondentUpdated = updateAdult(
      withAdditionalAdult,
      RESPONDENT_ID,
      (adult) => ({
        ...adult,
        name: "Alex Example",
        contact: { email: "alex@example.test", phone: "" },
        attendance: "attending"
      })
    );
    const bothUpdated = updateAdult(respondentUpdated, "adult-2", (adult) => ({
      ...adult,
      name: "Sam Example",
      contact: { email: "", phone: "+1 415 555 0199" },
      attendance: "not-sure"
    }));
    const withChildren = { ...bothUpdated, childrenAttending: 2 };

    expect(bothUpdated.adults).toEqual([
      {
        id: "adult-1",
        name: "Alex Example",
        contact: { email: "alex@example.test", phone: "" },
        attendance: "attending"
      },
      {
        id: "adult-2",
        name: "Sam Example",
        contact: { email: "", phone: "+1 415 555 0199" },
        attendance: "not-sure"
      }
    ]);
    expect(getAttendingCount(withChildren)).toBe(3);
  });

  it("clones nested draft collections", () => {
    const draft = addAdult(createInitialDraft());
    const clone = cloneDraft(draft);

    expect(clone).toEqual(draft);
    expect(clone).not.toBe(draft);
    expect(clone.adults).not.toBe(draft.adults);
    expect(clone.adults[0]).not.toBe(draft.adults[0]);
    expect(clone.adults[0]?.contact).not.toBe(draft.adults[0]?.contact);
    expect(clone.contact).not.toBe(draft.contact);
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
  it("starts at attendance and supports the pre-submit back-transition chain", () => {
    let state: RsvpPrototypeState = createInitialRsvpState();
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

  it("captures an independent submitted snapshot and clears the editable draft", () => {
    const draft = {
      ...updateAdult(createInitialDraft(), RESPONDENT_ID, (adult) => ({
        ...adult,
        attendance: "attending" as const,
        contact: { email: "adult@example.test", phone: "" },
        name: "Alex Example"
      })),
      contact: { email: "alex@example.test", phone: "" },
      guestSide: "brandon" as const
    };
    const activeState = rsvpPrototypeReducer(createInitialRsvpState(), {
      type: "replace-draft",
      draft
    });
    const submitted = rsvpPrototypeReducer(activeState, {
      type: "submission-accepted",
      submittedDraft: draft
    });

    expect(submitted.currentStage).toBe("confirmation");
    expect(submitted.draft).toEqual(createInitialDraft());
    expect(submitted.submittedDraft).toEqual(draft);
    expect(submitted.submittedDraft).not.toBe(draft);
    expect(submitted.submittedDraft?.adults).not.toBe(draft.adults);
    expect(submitted.submittedDraft?.adults[0]?.contact).not.toBe(
      draft.adults[0]?.contact
    );
    expect(submitted.submittedDraft?.contact).not.toBe(draft.contact);
  });

  it("does not expose edit transitions from confirmation and resets cleanly", () => {
    const confirmation = rsvpPrototypeReducer(createInitialRsvpState(), {
      type: "submission-accepted",
      submittedDraft: createInitialDraft()
    });

    expect(
      rsvpPrototypeReducer(confirmation, { type: "go-to", stage: "review" })
    ).toBe(confirmation);
    expect(rsvpPrototypeReducer(confirmation, { type: "back" })).toBe(
      confirmation
    );
    expect(
      rsvpPrototypeReducer(confirmation, {
        type: "submission-accepted",
        submittedDraft: createInitialDraft()
      })
    ).toBe(confirmation);
    expect(rsvpPrototypeReducer(confirmation, { type: "reset" })).toEqual(
      createInitialRsvpState()
    );
  });
});
