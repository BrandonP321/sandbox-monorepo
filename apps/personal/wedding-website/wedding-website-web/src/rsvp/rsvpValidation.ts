import type { RsvpDraft } from "./rsvpTypes";

type AdultFieldErrors = {
  attendance?: string;
  name?: string;
};

type PartyFieldErrors = {
  adults: Record<string, AdultFieldErrors>;
  childrenAttending?: string;
  guestSide?: string;
};

type DetailsFieldErrors = {
  contact?: string;
  email?: string;
  phone?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateParty(draft: RsvpDraft): PartyFieldErrors {
  const errors: PartyFieldErrors = { adults: {} };

  if (!draft.guestSide) {
    errors.guestSide = "Choose Niamh's side or Brandon's side.";
  }

  for (const [index, adult] of draft.adults.entries()) {
    const adultErrors: AdultFieldErrors = {};

    if (!adult.name.trim()) {
      adultErrors.name =
        index === 0
          ? "Enter your name."
          : `Enter a name for adult ${index + 1}.`;
    }
    if (!adult.attendance) {
      adultErrors.attendance = `Select an attendance response for ${
        adult.name.trim() || `adult ${index + 1}`
      }.`;
    }

    if (Object.keys(adultErrors).length > 0) {
      errors.adults[adult.id] = adultErrors;
    }
  }

  if (
    !Number.isInteger(draft.childrenAttending) ||
    draft.childrenAttending < 0
  ) {
    errors.childrenAttending = "Enter a whole number of zero or greater.";
  }

  return errors;
}

function validateDetails(draft: RsvpDraft): DetailsFieldErrors {
  const errors: DetailsFieldErrors = {};
  const email = draft.contact.email.trim();
  const phone = draft.contact.phone.trim();

  if (!email && !phone) {
    errors.contact = "Enter at least an email address or phone number.";
    return errors;
  }

  if (email && !emailPattern.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (phone) {
    const digitCount = phone.replace(/\D/g, "").length;
    if (digitCount < 7 || digitCount > 15) {
      errors.phone = "Enter a phone number with 7 to 15 digits.";
    }
  }

  return errors;
}

export {
  validateDetails,
  validateParty,
  type AdultFieldErrors,
  type DetailsFieldErrors,
  type PartyFieldErrors
};
