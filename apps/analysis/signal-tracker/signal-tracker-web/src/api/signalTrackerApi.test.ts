// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { signalTrackerApiErrorCodes } from "@repo/signal-tracker-shared";

import { loadRuntimeConfig } from "../config";
import { makeStore } from "../store";
import {
  apiBaseUrl,
  createJsonResponse,
  expectRouteRequest,
  stubRouteResponse
} from "./apiTestData";
import {
  persistenceRetryDelaysMs,
  selectPendingPersistenceRetryNotification
} from "./persistenceRetry";
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

  it("retries persistence unavailable errors with backoff", async () => {
    vi.useFakeTimers();
    try {
      loadRuntimeConfigMock.mockResolvedValue({
        apiBaseUrl
      });
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(
          createApiErrorResponse(
            signalTrackerApiErrorCodes.persistenceUnavailable,
            "Topic persistence is temporarily unavailable"
          )
        )
        .mockResolvedValueOnce(createJsonResponse({ ok: true }));
      vi.stubGlobal("fetch", fetchMock);

      const store = makeStore();
      const resultPromise = store
        .dispatch(signalTrackerApi.endpoints.getHealth.initiate())
        .unwrap();

      await vi.advanceTimersByTimeAsync(0);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(
        selectPendingPersistenceRetryNotification(store.getState())
      ).toMatchObject({
        attempt: 1,
        endpointName: "getHealth",
        requestType: "query"
      });

      await vi.advanceTimersByTimeAsync(persistenceRetryDelaysMs[0]);

      await expect(resultPromise).resolves.toEqual({ ok: true });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not retry other API errors", async () => {
    loadRuntimeConfigMock.mockResolvedValue({
      apiBaseUrl
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        createApiErrorResponse(
          signalTrackerApiErrorCodes.databaseUnavailable,
          "Database unavailable"
        )
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      makeStore()
        .dispatch(signalTrackerApi.endpoints.getHealth.initiate())
        .unwrap()
    ).rejects.toMatchObject({ status: 503 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
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

function createApiErrorResponse(code: string, message: string): Response {
  return new Response(
    JSON.stringify({
      error: {
        code,
        message
      }
    }),
    {
      status: 503,
      headers: {
        "content-type": "application/json"
      }
    }
  );
}
