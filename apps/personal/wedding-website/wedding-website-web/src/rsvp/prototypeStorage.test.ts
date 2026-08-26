import { describe, expect, it, vi } from "vitest";

import { addAdult, createInitialDraft, updateAdult } from "./rsvpDraft";
import { createInitialRsvpState } from "./rsvpState";
import {
  PROTOTYPE_STORAGE_KEY,
  PROTOTYPE_STORAGE_KEY_V1,
  PROTOTYPE_STORAGE_KEY_V2,
  PROTOTYPE_STORAGE_KEY_V3,
  PROTOTYPE_STORAGE_KEY_V4,
  PROTOTYPE_STORAGE_VERSION,
  STALE_PROTOTYPE_STORAGE_KEYS,
  createPrototypeStorage,
  type StorageLike
} from "./prototypeStorage";

function createMemoryStorage() {
  const values = new Map<string, string>();
  const storage: StorageLike = {
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => {
      values.delete(key);
    },
    setItem: (key, value) => {
      values.set(key, value);
    }
  };

  return { storage, values };
}

describe("prototypeStorage", () => {
  it("round-trips a valid version 5 draft and unresolved attempt", () => {
    const { storage, values } = createMemoryStorage();
    const adapter = createPrototypeStorage(() => storage);
    let draft = addAdult(createInitialDraft());
    draft = {
      ...draft,
      guestSide: "niamh",
      childrenAttending: 2,
      contact: { email: "party@example.test", phone: "" }
    };
    draft = updateAdult(draft, "adult-1", (adult) => ({
      ...adult,
      name: "Alex Example",
      contact: { email: "alex@example.test", phone: "" },
      attendance: "attending"
    }));
    draft = updateAdult(draft, "adult-2", (adult) => ({
      ...adult,
      name: "Sam Example",
      contact: { email: "", phone: "+1 415 555 0199" },
      attendance: "unable"
    }));
    const state = {
      currentStage: "review",
      draft,
      submittedDraft: null
    } as const;

    const unresolvedAttempt = {
      version: 1,
      contractVersion: 1,
      idempotencyKey: "7ad1a5a8-8e35-4d9d-99b0-21181700cb95",
      requestHash: "a".repeat(64)
    } as const;

    expect(adapter.write({ state, unresolvedAttempt })).toBe(true);

    expect(adapter.read()).toEqual({ state, unresolvedAttempt });
    const stored = JSON.parse(values.get(PROTOTYPE_STORAGE_KEY) ?? "{}");
    expect(stored).toMatchObject({ version: PROTOTYPE_STORAGE_VERSION });
    expect(stored.state).not.toHaveProperty("submittedDraft");
    expect(stored).toMatchObject({ unresolvedAttempt });
    expect(PROTOTYPE_STORAGE_KEY).toContain(":v5");
  });

  it.each([
    ["version 1", PROTOTYPE_STORAGE_KEY_V1],
    ["version 2", PROTOTYPE_STORAGE_KEY_V2],
    ["version 3", PROTOTYPE_STORAGE_KEY_V3],
    ["version 4", PROTOTYPE_STORAGE_KEY_V4]
  ])("discards stale %s storage without migration", (_label, key) => {
    const { storage, values } = createMemoryStorage();
    values.set(key, JSON.stringify({ version: 3, state: {} }));

    expect(createPrototypeStorage(() => storage).read()).toBeNull();
    expect(values.has(key)).toBe(false);
    expect(values.has(PROTOTYPE_STORAGE_KEY)).toBe(false);
  });

  it.each([
    ["malformed JSON", "not-json"],
    ["a stale version", JSON.stringify({ version: 3, state: {} })],
    [
      "an invalid state",
      JSON.stringify({ version: PROTOTYPE_STORAGE_VERSION, state: {} })
    ],
    [
      "invalid unresolved-attempt metadata",
      JSON.stringify({
        version: PROTOTYPE_STORAGE_VERSION,
        state: {
          currentStage: "review",
          draft: createInitialDraft()
        },
        unresolvedAttempt: {
          version: 1,
          contractVersion: 1,
          idempotencyKey: "not-a-uuid",
          requestHash: "not-a-sha256"
        }
      })
    ],
    [
      "a confirmation stage",
      JSON.stringify({
        version: PROTOTYPE_STORAGE_VERSION,
        state: { currentStage: "confirmation", draft: createInitialDraft() }
      })
    ],
    [
      "an adult without contact data",
      JSON.stringify({
        version: PROTOTYPE_STORAGE_VERSION,
        state: {
          currentStage: "attendance",
          draft: {
            ...createInitialDraft(),
            adults: [
              {
                id: "adult-1",
                name: "Alex Example",
                attendance: "attending"
              }
            ]
          }
        }
      })
    ],
    [
      "a duplicate adult id",
      JSON.stringify({
        version: PROTOTYPE_STORAGE_VERSION,
        state: {
          currentStage: "attendance",
          draft: {
            ...createInitialDraft(),
            adults: [
              {
                id: "adult-1",
                name: "One",
                contact: { email: "one@example.test", phone: "" },
                attendance: null
              },
              {
                id: "adult-1",
                name: "Two",
                contact: { email: "two@example.test", phone: "" },
                attendance: null
              }
            ]
          }
        }
      })
    ],
    [
      "an invalid children count",
      JSON.stringify({
        version: PROTOTYPE_STORAGE_VERSION,
        state: {
          currentStage: "attendance",
          draft: { ...createInitialDraft(), childrenAttending: -1 }
        }
      })
    ]
  ])(
    "falls back and removes current storage for %s",
    (_scenario, storedValue) => {
      const { storage, values } = createMemoryStorage();
      values.set(PROTOTYPE_STORAGE_KEY, storedValue);

      expect(createPrototypeStorage(() => storage).read()).toBeNull();
      expect(values.has(PROTOTYPE_STORAGE_KEY)).toBe(false);
    }
  );

  it("does not crash when storage access is unavailable", () => {
    const unavailableStorage = createPrototypeStorage(() => {
      throw new Error("Storage blocked");
    });

    expect(unavailableStorage.read()).toBeNull();
    expect(
      unavailableStorage.write({
        state: createInitialRsvpState(),
        unresolvedAttempt: null
      })
    ).toBe(false);
    expect(unavailableStorage.reset()).toBe(false);
  });

  it("resets every RSVP schema key and leaves unrelated storage alone", () => {
    const { storage, values } = createMemoryStorage();
    const adapter = createPrototypeStorage(() => storage);
    values.set(PROTOTYPE_STORAGE_KEY, "current draft");
    for (const key of STALE_PROTOTYPE_STORAGE_KEYS) {
      values.set(key, "stale draft");
    }
    values.set("unrelated", "keep me");

    adapter.reset();

    expect(values.has(PROTOTYPE_STORAGE_KEY)).toBe(false);
    for (const key of STALE_PROTOTYPE_STORAGE_KEYS) {
      expect(values.has(key)).toBe(false);
    }
    expect(values.get("unrelated")).toBe("keep me");
  });

  it("reports write and reset failures after storage is resolved", () => {
    const failingStorage: StorageLike = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => {
        throw new Error("Quota exceeded");
      }),
      removeItem: vi.fn(() => {
        throw new Error("Storage blocked");
      })
    };
    const adapter = createPrototypeStorage(() => failingStorage);

    expect(
      adapter.write({
        state: createInitialRsvpState(),
        unresolvedAttempt: null
      })
    ).toBe(false);
    expect(adapter.reset()).toBe(false);
  });
});
