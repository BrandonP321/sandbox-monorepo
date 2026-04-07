import { describe, expect, it } from "vitest";
import { createReloadMarkerUrl, parseReloadMarker } from "./dev-reload";

describe("dev reload helpers", () => {
  it("parses a valid reload marker payload", () => {
    expect(parseReloadMarker('{"updatedAt":123}')).toBe(123);
  });

  it("rejects invalid reload marker payloads", () => {
    expect(parseReloadMarker("not-json")).toBeNull();
    expect(parseReloadMarker('{"updatedAt":"123"}')).toBeNull();
    expect(parseReloadMarker("{}")).toBeNull();
  });

  it("adds a cache-busting query parameter to the marker url", () => {
    expect(createReloadMarkerUrl("chrome-extension://example/__dev_reload__.json", 456)).toBe(
      "chrome-extension://example/__dev_reload__.json?t=456"
    );
  });
});
