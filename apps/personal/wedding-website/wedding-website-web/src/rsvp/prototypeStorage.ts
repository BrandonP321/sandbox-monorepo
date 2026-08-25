import { getPrototypeFixture, isFixtureId } from "./prototypeFixtures";
import type {
  AttendanceStatus,
  RsvpDraft,
  RsvpPrototypeState,
  RsvpStage
} from "./rsvpTypes";

const PROTOTYPE_STORAGE_KEY = "wedding-rsvp-prototype:v1";
const PROTOTYPE_STORAGE_VERSION = 1;

type PrototypeStorageSnapshot = {
  version: typeof PROTOTYPE_STORAGE_VERSION;
  state: RsvpPrototypeState;
};

type StorageLike = Pick<Storage, "getItem" | "removeItem" | "setItem">;

type PrototypeStorage = {
  read: () => RsvpPrototypeState | null;
  reset: () => void;
  write: (state: RsvpPrototypeState) => void;
};

type StorageProvider = () => StorageLike | null | undefined;

const attendanceStatuses: readonly AttendanceStatus[] = [
  "attending",
  "not-sure",
  "unable"
];
const rsvpStages: readonly RsvpStage[] = [
  "landing",
  "attendance",
  "details",
  "review",
  "confirmation"
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasString(record: Record<string, unknown>, key: string): boolean {
  return typeof record[key] === "string";
}

function isDraft(value: unknown): value is RsvpDraft {
  if (!isRecord(value) || !isFixtureId(value.householdId)) {
    return false;
  }

  const fixture = getPrototypeFixture(value.householdId);
  const contact = value.contact;
  const inviteeResponses = value.inviteeResponses;

  if (
    !Array.isArray(inviteeResponses) ||
    !isRecord(contact) ||
    !hasString(contact, "email") ||
    !hasString(contact, "phone") ||
    !hasString(value, "dietaryOrAllergyNotes") ||
    !hasString(value, "accessibilityNotes") ||
    !hasString(value, "generalNote")
  ) {
    return false;
  }

  if (
    fixture.supportsChildCount
      ? !Number.isInteger(value.childCount) || Number(value.childCount) < 0
      : value.childCount !== null
  ) {
    return false;
  }

  if (inviteeResponses.length !== fixture.invitees.length) {
    return false;
  }

  return fixture.invitees.every((invitee, index) => {
    const response: unknown = inviteeResponses[index];

    if (
      !isRecord(response) ||
      response.inviteeId !== invitee.id ||
      !(
        response.attendance === null ||
        attendanceStatuses.includes(response.attendance as AttendanceStatus)
      )
    ) {
      return false;
    }

    if (!invitee.plusOneEligible) {
      return response.plusOne === null;
    }

    return (
      isRecord(response.plusOne) &&
      (response.plusOne.bringingGuest === null ||
        typeof response.plusOne.bringingGuest === "boolean") &&
      hasString(response.plusOne, "name")
    );
  });
}

function isPrototypeState(value: unknown): value is RsvpPrototypeState {
  if (
    !isRecord(value) ||
    !isFixtureId(value.selectedFixtureId) ||
    !rsvpStages.includes(value.currentStage as RsvpStage) ||
    !isDraft(value.draft) ||
    value.draft.householdId !== value.selectedFixtureId
  ) {
    return false;
  }

  return (
    value.savedResponse === null ||
    (isDraft(value.savedResponse) &&
      value.savedResponse.householdId === value.selectedFixtureId)
  );
}

function isSnapshot(value: unknown): value is PrototypeStorageSnapshot {
  return (
    isRecord(value) &&
    value.version === PROTOTYPE_STORAGE_VERSION &&
    isPrototypeState(value.state)
  );
}

const browserStorageProvider: StorageProvider = () =>
  typeof window === "undefined" ? null : window.localStorage;

function createPrototypeStorage(
  getStorage: StorageProvider = browserStorageProvider
): PrototypeStorage {
  return {
    read() {
      try {
        const rawValue = getStorage()?.getItem(PROTOTYPE_STORAGE_KEY);

        if (!rawValue) {
          return null;
        }

        const parsed: unknown = JSON.parse(rawValue);
        return isSnapshot(parsed) ? parsed.state : null;
      } catch {
        return null;
      }
    },
    write(state) {
      try {
        const snapshot: PrototypeStorageSnapshot = {
          version: PROTOTYPE_STORAGE_VERSION,
          state
        };
        getStorage()?.setItem(PROTOTYPE_STORAGE_KEY, JSON.stringify(snapshot));
      } catch {
        // The in-memory prototype remains usable when browser storage is blocked.
      }
    },
    reset() {
      try {
        getStorage()?.removeItem(PROTOTYPE_STORAGE_KEY);
      } catch {
        // Reset the React state even when browser storage is unavailable.
      }
    }
  };
}

const prototypeStorage = createPrototypeStorage();

export {
  PROTOTYPE_STORAGE_KEY,
  PROTOTYPE_STORAGE_VERSION,
  createPrototypeStorage,
  prototypeStorage,
  type PrototypeStorage,
  type StorageLike
};
