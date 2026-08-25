import type { FixtureId, HouseholdFixture, RsvpDraft } from "./rsvpTypes";

const DEFAULT_FIXTURE_ID: FixtureId = "couple";

const prototypeFixtures: readonly HouseholdFixture[] = [
  {
    id: "couple",
    demoLabel: "Couple household",
    householdName: "The Hart household",
    invitees: [
      { id: "rowan-hart", name: "Rowan Hart", plusOneEligible: false },
      { id: "ellis-hart", name: "Ellis Hart", plusOneEligible: false }
    ],
    supportsChildCount: false
  },
  {
    id: "single-plus-one",
    demoLabel: "Single invitee with plus-one",
    householdName: "Marlowe Chen",
    invitees: [
      { id: "marlowe-chen", name: "Marlowe Chen", plusOneEligible: true }
    ],
    supportsChildCount: false
  },
  {
    id: "family",
    demoLabel: "Family household",
    householdName: "The Bellamy household",
    invitees: [
      { id: "jules-bellamy", name: "Jules Bellamy", plusOneEligible: false },
      { id: "robin-bellamy", name: "Robin Bellamy", plusOneEligible: false }
    ],
    supportsChildCount: true
  }
];

function isFixtureId(value: unknown): value is FixtureId {
  return prototypeFixtures.some((fixture) => fixture.id === value);
}

function getPrototypeFixture(id: FixtureId): HouseholdFixture {
  const fixture = prototypeFixtures.find((candidate) => candidate.id === id);

  if (!fixture) {
    throw new Error(`Unknown RSVP prototype fixture: ${id}`);
  }

  return fixture;
}

function createDraftForFixture(fixtureId: FixtureId): RsvpDraft {
  const fixture = getPrototypeFixture(fixtureId);

  return {
    householdId: fixture.id,
    inviteeResponses: fixture.invitees.map((invitee) => ({
      inviteeId: invitee.id,
      attendance: null,
      plusOne: invitee.plusOneEligible
        ? { bringingGuest: null, name: "" }
        : null
    })),
    childCount: fixture.supportsChildCount ? 0 : null,
    contact: { email: "", phone: "" },
    dietaryOrAllergyNotes: "",
    accessibilityNotes: "",
    generalNote: ""
  };
}

export {
  DEFAULT_FIXTURE_ID,
  createDraftForFixture,
  getPrototypeFixture,
  isFixtureId,
  prototypeFixtures
};
