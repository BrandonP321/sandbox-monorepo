import { describe, expect, it } from "vitest";

import { signalTrackerApi } from "./api";
import { persistenceRetrySliceName } from "./api/persistenceRetry";
import { makeStore, store } from "./store";

describe("store", () => {
  it("registers the Signal Tracker app reducers", () => {
    expect(store.getState()).toHaveProperty(persistenceRetrySliceName);
    expect(store.getState()).toHaveProperty(signalTrackerApi.reducerPath);
  });

  it("creates isolated store instances for tests", () => {
    const firstStore = makeStore();
    const secondStore = makeStore();

    expect(firstStore).not.toBe(secondStore);
    expect(firstStore.getState()).toEqual(secondStore.getState());
  });
});
