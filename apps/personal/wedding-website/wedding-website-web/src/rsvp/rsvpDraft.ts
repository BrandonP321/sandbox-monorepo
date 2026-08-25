import type { AdultAttendee, RsvpDraft } from "./rsvpTypes";

const RESPONDENT_ID = "adult-1";

function createAdult(id: string): AdultAttendee {
  return {
    id,
    name: "",
    contact: { email: "", phone: "" },
    attendance: null
  };
}

function createInitialDraft(): RsvpDraft {
  return {
    guestSide: null,
    adults: [createAdult(RESPONDENT_ID)],
    childrenAttending: 0,
    contact: { email: "", phone: "" },
    dietaryOrAllergyNotes: "",
    accessibilityNotes: "",
    generalNote: ""
  };
}

function updateAdult(
  draft: RsvpDraft,
  adultId: string,
  update: (adult: AdultAttendee) => AdultAttendee
): RsvpDraft {
  return {
    ...draft,
    adults: draft.adults.map((adult) =>
      adult.id === adultId ? update(adult) : adult
    )
  };
}

function addAdult(draft: RsvpDraft): RsvpDraft {
  const nextNumber =
    Math.max(
      0,
      ...draft.adults.map((adult) => {
        const match = /^adult-(\d+)$/.exec(adult.id);
        return match ? Number(match[1]) : 0;
      })
    ) + 1;

  return {
    ...draft,
    adults: [...draft.adults, createAdult(`adult-${nextNumber}`)]
  };
}

function removeAdult(draft: RsvpDraft, adultId: string): RsvpDraft {
  const adultIndex = draft.adults.findIndex((adult) => adult.id === adultId);

  if (adultIndex <= 0) {
    return draft;
  }

  return {
    ...draft,
    adults: draft.adults.filter((adult) => adult.id !== adultId)
  };
}

function prefillPartyContactFromAdults(draft: RsvpDraft): RsvpDraft {
  const firstEmail = draft.adults.find((adult) => adult.contact.email.trim())
    ?.contact.email;
  const firstPhone = draft.adults.find((adult) => adult.contact.phone.trim())
    ?.contact.phone;

  return {
    ...draft,
    contact: {
      email: draft.contact.email.trim()
        ? draft.contact.email
        : firstEmail || "",
      phone: draft.contact.phone.trim() ? draft.contact.phone : firstPhone || ""
    }
  };
}

export {
  RESPONDENT_ID,
  addAdult,
  createInitialDraft,
  prefillPartyContactFromAdults,
  removeAdult,
  updateAdult
};
