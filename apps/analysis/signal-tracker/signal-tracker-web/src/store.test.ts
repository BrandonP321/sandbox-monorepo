import { describe, expect, it } from "vitest";

import { signalTrackerApi } from "./services/signalTrackerApi";
import { makeStore, store } from "./store";

describe("store", () => {
  it("registers the Signal Tracker RTK Query reducer", () => {
    expect(store.getState()).toHaveProperty(signalTrackerApi.reducerPath);
  });

  it("creates isolated store instances for tests", () => {
    const firstStore = makeStore();
    const secondStore = makeStore();

    expect(firstStore).not.toBe(secondStore);
    expect(firstStore.getState()).toEqual(secondStore.getState());
  });
});
