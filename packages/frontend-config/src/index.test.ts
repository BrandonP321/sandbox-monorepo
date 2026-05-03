import { describe, expect, it } from "vitest";

import { resolveApiBaseUrl } from "./index";

const apiBaseUrlByStage = {
  prod: "https://api.prod.example.com",
  dev: "https://api.dev.example.com"
} as const;

describe("resolveApiBaseUrl", () => {
  it("uses VITE_API_BASE_URL when present", () => {
    expect(
      resolveApiBaseUrl({
        env: {
          VITE_API_BASE_URL: " https://api.override.example.com ",
          VITE_API_STAGE: "prod"
        },
        apiBaseUrlByStage
      })
    ).toBe("https://api.override.example.com");
  });

  it("uses VITE_API_STAGE when no explicit API base URL is present", () => {
    expect(
      resolveApiBaseUrl({
        env: {
          VITE_API_STAGE: " dev "
        },
        apiBaseUrlByStage
      })
    ).toBe("https://api.dev.example.com");
  });

  it("defaults to localhost when no API env vars are present", () => {
    expect(
      resolveApiBaseUrl({
        env: {},
        apiBaseUrlByStage
      })
    ).toBe("http://localhost:3001");
  });

  it("supports a custom default API base URL", () => {
    expect(
      resolveApiBaseUrl({
        env: {},
        apiBaseUrlByStage,
        defaultApiBaseUrl: "http://localhost:4001"
      })
    ).toBe("http://localhost:4001");
  });

  it("rejects unsupported API stages", () => {
    expect(() =>
      resolveApiBaseUrl({
        env: {
          VITE_API_STAGE: "preview"
        },
        apiBaseUrlByStage
      })
    ).toThrow(
      "Unsupported VITE_API_STAGE: preview. Supported stages: prod, dev"
    );
  });
});
