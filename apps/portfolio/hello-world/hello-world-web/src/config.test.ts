import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadRuntimeConfig } from "./config";

describe("loadRuntimeConfig", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("uses VITE_API_BASE_URL when present", async () => {
    vi.stubEnv("VITE_API_BASE_URL", " https://example.com ");
    vi.stubEnv("VITE_API_STAGE", "prod");

    const config = await loadRuntimeConfig();

    expect(config.apiBaseUrl).toBe("https://example.com");
  });

  it("uses VITE_API_STAGE when present without an explicit API base URL", async () => {
    vi.stubEnv("VITE_API_STAGE", "prod");

    const config = await loadRuntimeConfig();

    expect(config.apiBaseUrl).toBe(
      "https://8nq5tlumrg.execute-api.us-east-1.amazonaws.com"
    );
  });

  it("falls back to localhost when no API env vars are present", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const config = await loadRuntimeConfig();

    expect(config.apiBaseUrl).toBe("http://localhost:3001");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects unsupported API stages", async () => {
    vi.stubEnv("VITE_API_STAGE", "dev");

    await expect(loadRuntimeConfig()).rejects.toThrow(
      "Unsupported VITE_API_STAGE: dev. Supported stages: prod"
    );
  });
});
