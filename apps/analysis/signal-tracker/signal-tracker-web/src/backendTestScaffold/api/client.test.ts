import { afterEach, describe, expect, it, vi } from "vitest";

import { postSignalTrackerApi } from "./client";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("postSignalTrackerApi", () => {
  it("posts to shared route specs and parses successful responses", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com");

    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true })
    } as Response);

    vi.stubGlobal("fetch", fetchMock);

    const result = await postSignalTrackerApi({
      routeName: "getHealth",
      body: {}
    });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://api.example.com/get-health",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({})
      })
    );
  });

  it("throws standard API errors from failed responses", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce({
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
        routeName: "getHealth",
        body: {}
      })
    ).rejects.toMatchObject({
      statusCode: 503,
      code: "PERSISTENCE_UNAVAILABLE",
      message: "Topic persistence is temporarily unavailable"
    });
  });
});
