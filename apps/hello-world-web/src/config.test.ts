import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadRuntimeConfig } from "./config";

describe("loadRuntimeConfig", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("falls back to localhost when config is missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      })
    );

    const config = await loadRuntimeConfig();

    expect(config.apiBaseUrl).toBe("http://localhost:3001");
  });
});
