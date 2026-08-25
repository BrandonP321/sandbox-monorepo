import type {
  AttendanceStatus,
  GuestSide,
  RsvpDraft,
  RsvpPrototypeState,
  RsvpStage
} from "./rsvpTypes";

const LEGACY_PROTOTYPE_STORAGE_KEY = "wedding-rsvp-prototype:v1";
const PREVIOUS_PROTOTYPE_STORAGE_KEY = "wedding-rsvp-prototype:v2";
const PROTOTYPE_STORAGE_KEY = "wedding-rsvp-prototype:v3";
const PROTOTYPE_STORAGE_VERSION = 3;

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
const guestSides: readonly GuestSide[] = ["niamh", "brandon"];
const rsvpStages: readonly RsvpStage[] = [
  "attendance",
  "details",
  "review",
  "confirmation"
];
const persistedRsvpStages = ["landing", ...rsvpStages] as const;
type PersistedRsvpStage = (typeof persistedRsvpStages)[number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasString(record: Record<string, unknown>, key: string): boolean {
  return typeof record[key] === "string";
}

function isDraft(value: unknown): value is RsvpDraft {
  if (!isRecord(value)) {
    return false;
  }

  const contact = value.contact;
  const adults = value.adults;

  if (
    !(
      value.guestSide === null ||
      guestSides.includes(value.guestSide as GuestSide)
    ) ||
    !Array.isArray(adults) ||
    adults.length === 0 ||
    typeof value.childrenAttending !== "number" ||
    !Number.isInteger(value.childrenAttending) ||
    value.childrenAttending < 0 ||
    !isRecord(contact) ||
    !hasString(contact, "email") ||
    !hasString(contact, "phone") ||
    !hasString(value, "dietaryOrAllergyNotes") ||
    !hasString(value, "accessibilityNotes") ||
    !hasString(value, "generalNote")
  ) {
    return false;
  }

  const adultIds = new Set<string>();

  return adults.every((adult: unknown) => {
    const adultContact = isRecord(adult) ? adult.contact : undefined;

    if (
      !isRecord(adult) ||
      !hasString(adult, "id") ||
      !hasString(adult, "name") ||
      !isRecord(adultContact) ||
      !hasString(adultContact, "email") ||
      !hasString(adultContact, "phone") ||
      !(
        adult.attendance === null ||
        attendanceStatuses.includes(adult.attendance as AttendanceStatus)
      ) ||
      adultIds.has(adult.id as string)
    ) {
      return false;
    }

    adultIds.add(adult.id as string);
    return true;
  });
}

function parsePrototypeState(value: unknown): RsvpPrototypeState | null {
  if (!isRecord(value) || !isDraft(value.draft)) {
    return null;
  }

  const currentStage = value.currentStage;
  if (
    typeof currentStage !== "string" ||
    !persistedRsvpStages.includes(currentStage as PersistedRsvpStage)
  ) {
    return null;
  }

  return {
    currentStage:
      currentStage === "landing" ? "attendance" : (currentStage as RsvpStage),
    draft: value.draft
  };
}

function parseSnapshot(value: unknown): RsvpPrototypeState | null {
  if (!isRecord(value) || value.version !== PROTOTYPE_STORAGE_VERSION) {
    return null;
  }

  return parsePrototypeState(value.state);
}

const browserStorageProvider: StorageProvider = () =>
  typeof window === "undefined" ? null : window.localStorage;

function createPrototypeStorage(
  getStorage: StorageProvider = browserStorageProvider
): PrototypeStorage {
  return {
    read() {
      try {
        const storage = getStorage();
        const rawValue = storage?.getItem(PROTOTYPE_STORAGE_KEY);

        if (storage?.getItem(LEGACY_PROTOTYPE_STORAGE_KEY)) {
          storage.removeItem(LEGACY_PROTOTYPE_STORAGE_KEY);
        }
        if (storage?.getItem(PREVIOUS_PROTOTYPE_STORAGE_KEY)) {
          storage.removeItem(PREVIOUS_PROTOTYPE_STORAGE_KEY);
        }

        if (!rawValue) {
          return null;
        }

        const parsed: unknown = JSON.parse(rawValue);
        const restoredState = parseSnapshot(parsed);
        if (!restoredState) {
          storage?.removeItem(PROTOTYPE_STORAGE_KEY);
          return null;
        }

        return restoredState;
      } catch {
        try {
          getStorage()?.removeItem(PROTOTYPE_STORAGE_KEY);
        } catch {
          // Storage may be unavailable as well as unreadable.
        }
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
        const storage = getStorage();
        storage?.removeItem(PROTOTYPE_STORAGE_KEY);
        storage?.removeItem(LEGACY_PROTOTYPE_STORAGE_KEY);
        storage?.removeItem(PREVIOUS_PROTOTYPE_STORAGE_KEY);
      } catch {
        // Reset the React state even when browser storage is unavailable.
      }
    }
  };
}

const prototypeStorage = createPrototypeStorage();

export {
  LEGACY_PROTOTYPE_STORAGE_KEY,
  PREVIOUS_PROTOTYPE_STORAGE_KEY,
  PROTOTYPE_STORAGE_KEY,
  PROTOTYPE_STORAGE_VERSION,
  createPrototypeStorage,
  prototypeStorage,
  type PrototypeStorage,
  type StorageLike
};
