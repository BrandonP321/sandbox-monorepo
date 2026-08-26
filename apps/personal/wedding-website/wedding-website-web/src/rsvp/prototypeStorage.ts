import type {
  AttendanceStatus,
  GuestSide,
  RsvpActiveState,
  RsvpDraft,
  RsvpFormStage,
  UnresolvedRsvpAttemptV1
} from "./rsvpTypes";

const PROTOTYPE_STORAGE_KEY_V1 = "wedding-rsvp-prototype:v1";
const PROTOTYPE_STORAGE_KEY_V2 = "wedding-rsvp-prototype:v2";
const PROTOTYPE_STORAGE_KEY_V3 = "wedding-rsvp-prototype:v3";
const PROTOTYPE_STORAGE_KEY_V4 = "wedding-rsvp-prototype:v4";
const PROTOTYPE_STORAGE_KEY = "wedding-rsvp-prototype:v5";
const PROTOTYPE_STORAGE_VERSION = 5;
const STALE_PROTOTYPE_STORAGE_KEYS = [
  PROTOTYPE_STORAGE_KEY_V1,
  PROTOTYPE_STORAGE_KEY_V2,
  PROTOTYPE_STORAGE_KEY_V3,
  PROTOTYPE_STORAGE_KEY_V4
] as const;

type PersistedRsvpState = {
  currentStage: RsvpFormStage;
  draft: RsvpDraft;
};

type PrototypeStorageSnapshot = {
  version: typeof PROTOTYPE_STORAGE_VERSION;
  state: PersistedRsvpState;
  unresolvedAttempt: UnresolvedRsvpAttemptV1 | null;
};

type RestoredRsvpSession = {
  state: RsvpActiveState;
  unresolvedAttempt: UnresolvedRsvpAttemptV1 | null;
};

type StorageLike = Pick<Storage, "getItem" | "removeItem" | "setItem">;

type PrototypeStorage = {
  read: () => RestoredRsvpSession | null;
  reset: () => boolean;
  write: (session: RestoredRsvpSession) => boolean;
};

type StorageProvider = () => StorageLike | null | undefined;

const attendanceStatuses: readonly AttendanceStatus[] = [
  "attending",
  "not-sure",
  "unable"
];
const guestSides: readonly GuestSide[] = ["niamh", "brandon"];
const persistedRsvpStages: readonly RsvpFormStage[] = [
  "attendance",
  "details",
  "review"
];

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

function parsePrototypeState(value: unknown): RsvpActiveState | null {
  if (!isRecord(value) || !isDraft(value.draft)) {
    return null;
  }

  const currentStage = value.currentStage;
  if (
    typeof currentStage !== "string" ||
    !persistedRsvpStages.includes(currentStage as RsvpFormStage)
  ) {
    return null;
  }

  return {
    currentStage: currentStage as RsvpFormStage,
    draft: value.draft,
    submittedDraft: null
  };
}

const uuidV4Pattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const sha256Pattern = /^[0-9a-f]{64}$/;

function parseUnresolvedAttempt(
  value: unknown
): UnresolvedRsvpAttemptV1 | null | undefined {
  if (value === null) {
    return null;
  }
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    value.contractVersion !== 1 ||
    typeof value.idempotencyKey !== "string" ||
    !uuidV4Pattern.test(value.idempotencyKey) ||
    typeof value.requestHash !== "string" ||
    !sha256Pattern.test(value.requestHash)
  ) {
    return undefined;
  }

  return {
    version: 1,
    contractVersion: 1,
    idempotencyKey: value.idempotencyKey,
    requestHash: value.requestHash
  };
}

function parseSnapshot(value: unknown): RestoredRsvpSession | null {
  if (!isRecord(value) || value.version !== PROTOTYPE_STORAGE_VERSION) {
    return null;
  }

  const state = parsePrototypeState(value.state);
  const unresolvedAttempt = parseUnresolvedAttempt(value.unresolvedAttempt);

  return state && unresolvedAttempt !== undefined
    ? { state, unresolvedAttempt }
    : null;
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

        for (const staleKey of STALE_PROTOTYPE_STORAGE_KEYS) {
          if (storage?.getItem(staleKey)) {
            storage.removeItem(staleKey);
          }
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
    write({ state, unresolvedAttempt }) {
      try {
        const storage = getStorage();
        if (!storage) {
          return false;
        }
        const snapshot: PrototypeStorageSnapshot = {
          version: PROTOTYPE_STORAGE_VERSION,
          state: { currentStage: state.currentStage, draft: state.draft },
          unresolvedAttempt
        };
        storage.setItem(PROTOTYPE_STORAGE_KEY, JSON.stringify(snapshot));
        return true;
      } catch {
        return false;
      }
    },
    reset() {
      try {
        const storage = getStorage();
        if (!storage) {
          return false;
        }
        storage?.removeItem(PROTOTYPE_STORAGE_KEY);
        for (const staleKey of STALE_PROTOTYPE_STORAGE_KEYS) {
          storage?.removeItem(staleKey);
        }
        return true;
      } catch {
        return false;
      }
    }
  };
}

const prototypeStorage = createPrototypeStorage();

export {
  PROTOTYPE_STORAGE_KEY,
  PROTOTYPE_STORAGE_KEY_V1,
  PROTOTYPE_STORAGE_KEY_V2,
  PROTOTYPE_STORAGE_KEY_V3,
  PROTOTYPE_STORAGE_KEY_V4,
  PROTOTYPE_STORAGE_VERSION,
  STALE_PROTOTYPE_STORAGE_KEYS,
  createPrototypeStorage,
  prototypeStorage,
  type PrototypeStorage,
  type RestoredRsvpSession,
  type StorageLike
};
