type AttendanceStatus = "attending" | "not-sure" | "unable";

type GuestSide = "niamh" | "brandon";

type RsvpFormStage = "attendance" | "details" | "review";

type RsvpStage = RsvpFormStage | "confirmation";

type ContactDetails = {
  email: string;
  phone: string;
};

type AdultAttendee = {
  id: string;
  name: string;
  contact: ContactDetails;
  attendance: AttendanceStatus | null;
};

type RsvpDraft = {
  guestSide: GuestSide | null;
  adults: AdultAttendee[];
  childrenAttending: number;
  contact: ContactDetails;
  dietaryOrAllergyNotes: string;
  accessibilityNotes: string;
  generalNote: string;
};

type UnresolvedRsvpAttemptV1 = {
  version: 1;
  contractVersion: 1;
  idempotencyKey: string;
  requestHash: string;
};

type RsvpSubmissionStatus =
  | { state: "idle" }
  | { state: "submitting" }
  | {
      reason: "busy" | "response-unconfirmed";
      state: "retryable";
    }
  | {
      reason: "answers" | "preparation";
      state: "request-error";
    }
  | { state: "conflict" };

type RsvpActiveState = {
  currentStage: RsvpFormStage;
  draft: RsvpDraft;
  submittedDraft: null;
};

type RsvpConfirmationState = {
  currentStage: "confirmation";
  draft: RsvpDraft;
  submittedDraft: RsvpDraft;
};

type RsvpPrototypeState = RsvpActiveState | RsvpConfirmationState;

export type {
  AdultAttendee,
  AttendanceStatus,
  ContactDetails,
  GuestSide,
  RsvpActiveState,
  RsvpConfirmationState,
  RsvpDraft,
  RsvpFormStage,
  RsvpPrototypeState,
  RsvpStage,
  RsvpSubmissionStatus,
  UnresolvedRsvpAttemptV1
};
