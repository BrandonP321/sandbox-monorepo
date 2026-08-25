type AttendanceStatus = "attending" | "not-sure" | "unable";

type GuestSide = "niamh" | "brandon";

type RsvpStage =
  | "landing"
  | "attendance"
  | "details"
  | "review"
  | "confirmation";

type AdultAttendee = {
  id: string;
  name: string;
  attendance: AttendanceStatus | null;
};

type ContactDetails = {
  email: string;
  phone: string;
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

type RsvpPrototypeState = {
  currentStage: RsvpStage;
  draft: RsvpDraft;
};

export type {
  AdultAttendee,
  AttendanceStatus,
  ContactDetails,
  GuestSide,
  RsvpDraft,
  RsvpPrototypeState,
  RsvpStage
};
