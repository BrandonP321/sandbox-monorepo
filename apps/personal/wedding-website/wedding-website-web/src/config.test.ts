import { describe, expect, it } from "vitest";

import { DEFAULT_WEDDING_API_BASE_URL, loadRuntimeConfig } from "./config";

describe("loadRuntimeConfig", () => {
  it("uses an explicit API base URL when present", () => {
    expect(
      loadRuntimeConfig({
        VITE_API_BASE_URL: " https://api.example.test/ "
      }).apiBaseUrl
    ).toBe("https://api.example.test/");
  });

  it("defaults local development to the in-memory API", () => {
    expect(loadRuntimeConfig({}).apiBaseUrl).toBe(DEFAULT_WEDDING_API_BASE_URL);
  });

  it("does not introduce a stage-based production URL", () => {
    expect(() => loadRuntimeConfig({ VITE_API_STAGE: "prod" })).toThrow(
      "Unsupported VITE_API_STAGE: prod"
    );
  });
});
