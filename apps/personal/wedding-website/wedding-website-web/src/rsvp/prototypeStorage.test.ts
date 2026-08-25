import { describe, expect, it, vi } from "vitest";

import { addAdult, createInitialDraft, updateAdult } from "./rsvpDraft";
import { createInitialRsvpState } from "./rsvpState";
import {
  LEGACY_PROTOTYPE_STORAGE_KEY,
  PROTOTYPE_STORAGE_KEY,
  PROTOTYPE_STORAGE_VERSION,
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
  it("round-trips a valid version 2 self-entry draft", () => {
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
      attendance: "attending"
    }));
    draft = updateAdult(draft, "adult-2", (adult) => ({
      ...adult,
      name: "Sam Example",
      attendance: "unable"
    }));
    const state = { currentStage: "details", draft } as const;

    adapter.write(state);

    expect(adapter.read()).toEqual(state);
    expect(JSON.parse(values.get(PROTOTYPE_STORAGE_KEY) ?? "{}")).toMatchObject(
      { version: PROTOTYPE_STORAGE_VERSION }
    );
    expect(PROTOTYPE_STORAGE_KEY).toContain(":v2");
  });

  it("discards fixture-era version 1 storage without converting it", () => {
    const { storage, values } = createMemoryStorage();
    values.set(
      LEGACY_PROTOTYPE_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        state: {
          selectedFixtureId: "family",
          draft: { householdId: "family" }
        }
      })
    );

    expect(createPrototypeStorage(() => storage).read()).toBeNull();
    expect(values.has(LEGACY_PROTOTYPE_STORAGE_KEY)).toBe(false);
    expect(values.has(PROTOTYPE_STORAGE_KEY)).toBe(false);
  });

  it.each([
    ["malformed JSON", "not-json"],
    ["a stale version", JSON.stringify({ version: 1, state: {} })],
    [
      "an invalid state",
      JSON.stringify({ version: PROTOTYPE_STORAGE_VERSION, state: {} })
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
              { id: "adult-1", name: "One", attendance: null },
              { id: "adult-1", name: "Two", attendance: null }
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
    expect(() =>
      unavailableStorage.write(createInitialRsvpState())
    ).not.toThrow();
    expect(() => unavailableStorage.reset()).not.toThrow();
  });

  it("resets both RSVP schema keys and leaves unrelated storage alone", () => {
    const { storage, values } = createMemoryStorage();
    const adapter = createPrototypeStorage(() => storage);
    values.set(PROTOTYPE_STORAGE_KEY, "current draft");
    values.set(LEGACY_PROTOTYPE_STORAGE_KEY, "fixture-era draft");
    values.set("unrelated", "keep me");

    adapter.reset();

    expect(values.has(PROTOTYPE_STORAGE_KEY)).toBe(false);
    expect(values.has(LEGACY_PROTOTYPE_STORAGE_KEY)).toBe(false);
    expect(values.get("unrelated")).toBe("keep me");
  });

  it("swallows write and reset failures after storage is resolved", () => {
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

    expect(() => adapter.write(createInitialRsvpState())).not.toThrow();
    expect(() => adapter.reset()).not.toThrow();
  });
});
