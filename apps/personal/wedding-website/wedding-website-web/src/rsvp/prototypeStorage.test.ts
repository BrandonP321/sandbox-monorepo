import { describe, expect, it, vi } from "vitest";

import { createInitialRsvpState } from "./rsvpState";
import {
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
  it("round-trips a valid versioned prototype state", () => {
    const { storage, values } = createMemoryStorage();
    const adapter = createPrototypeStorage(() => storage);
    const state = {
      ...createInitialRsvpState(),
      currentStage: "attendance"
    } as const;

    adapter.write(state);

    expect(adapter.read()).toEqual(state);
    expect(JSON.parse(values.get(PROTOTYPE_STORAGE_KEY) ?? "{}")).toMatchObject(
      { version: PROTOTYPE_STORAGE_VERSION }
    );
  });

  it.each([
    ["malformed JSON", "not-json"],
    ["a stale version", JSON.stringify({ version: 0, state: {} })],
    [
      "an invalid state",
      JSON.stringify({ version: PROTOTYPE_STORAGE_VERSION, state: {} })
    ]
  ])("falls back safely for %s", (_scenario, storedValue) => {
    const { storage, values } = createMemoryStorage();
    values.set(PROTOTYPE_STORAGE_KEY, storedValue);

    expect(createPrototypeStorage(() => storage).read()).toBeNull();
  });

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

  it("resets only the prototype key", () => {
    const { storage, values } = createMemoryStorage();
    const adapter = createPrototypeStorage(() => storage);
    values.set(PROTOTYPE_STORAGE_KEY, "prototype data");
    values.set("unrelated", "keep me");

    adapter.reset();

    expect(values.has(PROTOTYPE_STORAGE_KEY)).toBe(false);
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
