import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchHealthStatus } from "./health";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchHealthStatus", () => {
  it("uses the DB-free health route without retrying failed requests", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce({
        ok: false,
        status: 404
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 503
      } as Response);

    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchHealthStatus()).rejects.toThrow(
      "Unable to reach the Signal Tracker API."
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(1, "/config.json", {
      cache: "no-store"
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:3001/get-health",
      {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({})
      }
    );
  });
});
