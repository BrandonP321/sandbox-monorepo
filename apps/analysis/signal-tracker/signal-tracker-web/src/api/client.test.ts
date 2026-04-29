import { afterEach, describe, expect, it, vi } from "vitest";

import { signalTrackerRoutes } from "@repo/signal-tracker-shared";

import { postSignalTrackerApi } from "./client";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("postSignalTrackerApi", () => {
  it("posts to shared route specs and parses successful responses", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ apiBaseUrl: "https://api.example.com" })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true })
      } as Response);

    vi.stubGlobal("fetch", fetchMock);

    const result = await postSignalTrackerApi({
      route: signalTrackerRoutes.getHealth,
      body: {},
      responseSchema: {
        parse: (value) => value as { ok: boolean }
      }
    });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://api.example.com/get-health",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({})
      })
    );
  });

  it("throws standard API errors from failed responses", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce({
        ok: false,
        status: 404
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({
          error: {
            code: "PERSISTENCE_UNAVAILABLE",
            message: "Topic persistence is temporarily unavailable"
          }
        })
      } as Response);

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      postSignalTrackerApi({
        route: signalTrackerRoutes.createTopic,
        body: {},
        responseSchema: {
          parse: (value) => value as unknown
        }
      })
    ).rejects.toMatchObject({
      statusCode: 503,
      code: "PERSISTENCE_UNAVAILABLE",
      message: "Topic persistence is temporarily unavailable"
    });
  });
});
