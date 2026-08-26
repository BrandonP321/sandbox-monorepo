import type { ContactDetails, RsvpDraft } from "./rsvpTypes";

const CONTACT_REQUIRED_MESSAGE =
  "Enter at least one email address or phone number for any attendee.";
const CONTACT_REQUIRED_TITLE = "Contact details required";

type ContactFieldErrors = {
  email?: string;
  phone?: string;
};

type AdultFieldErrors = ContactFieldErrors & {
  attendance?: string;
  name?: string;
};

type PartyFieldErrors = {
  adults: Record<string, AdultFieldErrors>;
  childrenAttending?: string;
  contact?: string;
  guestSide?: string;
};

type DetailsFieldErrors = ContactFieldErrors & {
  contact?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateContactFields(contact: ContactDetails): ContactFieldErrors {
  const errors: ContactFieldErrors = {};
  const email = contact.email.trim();
  const phone = contact.phone.trim();

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

function validateParty(draft: RsvpDraft): PartyFieldErrors {
  const errors: PartyFieldErrors = { adults: {} };

  if (!draft.guestSide) {
    errors.guestSide = "Choose Niamh's side or Brandon's side.";
  }

  for (const [index, adult] of draft.adults.entries()) {
    const adultErrors: AdultFieldErrors = validateContactFields(adult.contact);

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
    !draft.adults.some(
      (adult) => adult.contact.email.trim() || adult.contact.phone.trim()
    )
  ) {
    errors.contact = CONTACT_REQUIRED_MESSAGE;
  }

  if (
    !Number.isInteger(draft.childrenAttending) ||
    draft.childrenAttending < 0
  ) {
    errors.childrenAttending = "Enter a whole number of zero or greater.";
  }

  return errors;
}

function hasPartyErrors(errors: PartyFieldErrors): boolean {
  return Boolean(
    errors.guestSide ||
    errors.contact ||
    errors.childrenAttending ||
    Object.keys(errors.adults).length > 0
  );
}

function validateDetails(draft: RsvpDraft): DetailsFieldErrors {
  const errors: DetailsFieldErrors = {};
  const email = draft.contact.email.trim();
  const phone = draft.contact.phone.trim();

  if (!email && !phone) {
    errors.contact = CONTACT_REQUIRED_MESSAGE;
  }

  Object.assign(errors, validateContactFields(draft.contact));

  return errors;
}

function hasDetailsErrors(errors: DetailsFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export {
  CONTACT_REQUIRED_MESSAGE,
  CONTACT_REQUIRED_TITLE,
  hasDetailsErrors,
  hasPartyErrors,
  validateDetails,
  validateParty,
  type AdultFieldErrors,
  type ContactFieldErrors,
  type DetailsFieldErrors,
  type PartyFieldErrors
};
