// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { loadRuntimeConfig } from "../config";
import { makeStore } from "../store";
import {
  apiBaseUrl,
  createJsonResponse,
  expectRouteRequest,
  stubRouteResponse
} from "./apiTestData";
import { signalTrackerApi } from ".";

vi.mock("../config", () => ({
  loadRuntimeConfig: vi.fn()
}));

const loadRuntimeConfigMock = vi.mocked(loadRuntimeConfig);

describe("signalTrackerApi", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("calls the shared health route contract through RTK Query", async () => {
    loadRuntimeConfigMock.mockResolvedValue({
      apiBaseUrl
    });
    const fetchMock = stubRouteResponse("getHealth", { ok: true });

    const store = makeStore();
    const result = await store
      .dispatch(signalTrackerApi.endpoints.getHealth.initiate())
      .unwrap();

    expect(result).toEqual({ ok: true });
    expect(loadRuntimeConfigMock).toHaveBeenCalledTimes(1);
    await expectRouteRequest(fetchMock, "getHealth", {});
  });

  it("rejects health responses that do not match the shared contract", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    loadRuntimeConfigMock.mockResolvedValue({
      apiBaseUrl
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(createJsonResponse({ ok: "yes" }))
    );

    const store = makeStore();

    try {
      await expect(
        store.dispatch(signalTrackerApi.endpoints.getHealth.initiate()).unwrap()
      ).rejects.toThrow();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
