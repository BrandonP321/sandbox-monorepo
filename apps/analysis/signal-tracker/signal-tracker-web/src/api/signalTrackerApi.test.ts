// @vitest-environment node

import type { Mock } from "vitest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { loadRuntimeConfig } from "../config";
import { makeStore } from "../store";
import { evidenceApi, signalTrackerApi, topicApi } from ".";

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
      apiBaseUrl: "https://signal-tracker-api.test"
    });
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      })
    );

    vi.stubGlobal("fetch", fetchMock);

    const store = makeStore();
    const result = await store
      .dispatch(signalTrackerApi.endpoints.getHealth.initiate())
      .unwrap();

    expect(result).toEqual({ ok: true });
    expect(loadRuntimeConfigMock).toHaveBeenCalledTimes(1);

    const request = getFetchRequest(fetchMock);

    expect(request.url).toBe("https://signal-tracker-api.test/get-health");
    expect(request.method).toBe("POST");
    expect(await request.clone().json()).toEqual({});
  });

  it("rejects health responses that do not match the shared contract", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    loadRuntimeConfigMock.mockResolvedValue({
      apiBaseUrl: "https://signal-tracker-api.test"
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: "yes" }), {
          status: 200,
          headers: {
            "content-type": "application/json"
          }
        })
      )
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

  it("calls the shared list topics route contract through RTK Query", async () => {
    loadRuntimeConfigMock.mockResolvedValue({
      apiBaseUrl: "https://signal-tracker-api.test"
    });
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          topics: [
            {
              id: "topic-1",
              title: "Topic 1",
              framingQuestion: "What changed?",
              status: "active",
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-01-01T00:00:00.000Z",
              reviewCadence: "weekly"
            }
          ]
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json"
          }
        }
      )
    );

    vi.stubGlobal("fetch", fetchMock);

    const store = makeStore();
    const result = await store
      .dispatch(topicApi.endpoints.listTopics.initiate())
      .unwrap();

    expect(result.topics).toHaveLength(1);

    const request = getFetchRequest(fetchMock);

    expect(request.url).toBe("https://signal-tracker-api.test/list-topics");
    expect(request.method).toBe("POST");
    expect(await request.clone().json()).toEqual({});
  });

  it("calls the shared list evidence route contract through RTK Query", async () => {
    loadRuntimeConfigMock.mockResolvedValue({
      apiBaseUrl: "https://signal-tracker-api.test"
    });
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          evidence: [
            {
              source: {
                id: "source-1",
                canonicalName: "Agency",
                sourceType: "government",
                createdAt: "2026-01-01T00:00:00.000Z",
                updatedAt: "2026-01-01T00:00:00.000Z"
              },
              evidenceItem: {
                id: "evidence-1",
                sourceId: "source-1",
                title: "Evidence",
                capturedAt: "2026-01-01T00:00:00.000Z",
                createdAt: "2026-01-01T00:00:00.000Z",
                updatedAt: "2026-01-01T00:00:00.000Z",
                metadata: {}
              }
            }
          ]
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json"
          }
        }
      )
    );

    vi.stubGlobal("fetch", fetchMock);

    const store = makeStore();
    const result = await store
      .dispatch(evidenceApi.endpoints.listEvidenceItems.initiate())
      .unwrap();

    expect(result.evidence).toHaveLength(1);

    const request = getFetchRequest(fetchMock);

    expect(request.url).toBe(
      "https://signal-tracker-api.test/list-evidence-items"
    );
    expect(request.method).toBe("POST");
    expect(await request.clone().json()).toEqual({});
  });
});

function getFetchRequest(fetchMock: Mock): Request {
  const [input, init] = fetchMock.mock.calls[0] ?? [];

  if (input instanceof Request) {
    return input;
  }

  return new Request(input as RequestInfo | URL, init);
}
