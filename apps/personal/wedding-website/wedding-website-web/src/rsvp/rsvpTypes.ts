type FixtureId = "couple" | "single-plus-one" | "family";

type AttendanceStatus = "attending" | "not-sure" | "unable";

type RsvpStage =
  | "landing"
  | "attendance"
  | "details"
  | "review"
  | "confirmation";

type NamedInvitee = {
  id: string;
  name: string;
  plusOneEligible: boolean;
};

type HouseholdFixture = {
  id: FixtureId;
  demoLabel: string;
  householdName: string;
  invitees: readonly NamedInvitee[];
  supportsChildCount: boolean;
};

type PlusOneResponse = {
  bringingGuest: boolean | null;
  name: string;
};

type InviteeResponse = {
  inviteeId: string;
  attendance: AttendanceStatus | null;
  plusOne: PlusOneResponse | null;
};

type ContactDetails = {
  email: string;
  phone: string;
};

type RsvpDraft = {
  householdId: FixtureId;
  inviteeResponses: InviteeResponse[];
  childCount: number | null;
  contact: ContactDetails;
  dietaryOrAllergyNotes: string;
  accessibilityNotes: string;
  generalNote: string;
};

type RsvpPrototypeState = {
  currentStage: RsvpStage;
  selectedFixtureId: FixtureId;
  draft: RsvpDraft;
  savedResponse: RsvpDraft | null;
};

export type {
  AttendanceStatus,
  ContactDetails,
  FixtureId,
  HouseholdFixture,
  InviteeResponse,
  NamedInvitee,
  PlusOneResponse,
  RsvpDraft,
  RsvpPrototypeState,
  RsvpStage
};
