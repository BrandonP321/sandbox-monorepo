import { describe, expect, it } from "vitest";

import {
  createTrimmedHttpUrlString,
  optionalClearableTrimmedString,
  optionalTrimmedNonEmptyString,
  optionalTrimmedString,
  optionalTrimmedUrlString,
  trimmedRequiredString,
  trimmedRequiredStringArray
} from "./index";

describe("string schema helpers", () => {
  it("trims required strings and rejects blank values", () => {
    expect(trimmedRequiredString.parse("  value  ")).toBe("value");
    expect(() => trimmedRequiredString.parse("   ")).toThrow();
  });

  it("turns blank optional trimmed strings into undefined", () => {
    expect(optionalTrimmedString.parse("  value  ")).toBe("value");
    expect(optionalTrimmedString.parse("   ")).toBeUndefined();
    expect(optionalTrimmedString.parse(undefined)).toBeUndefined();
  });

  it("keeps provided optional non-empty strings non-blank", () => {
    expect(optionalTrimmedNonEmptyString.parse("  value  ")).toBe("value");
    expect(optionalTrimmedNonEmptyString.parse(undefined)).toBeUndefined();
    expect(() => optionalTrimmedNonEmptyString.parse("   ")).toThrow();
  });

  it("turns clearable blank and null strings into null", () => {
    expect(optionalClearableTrimmedString.parse("  value  ")).toBe("value");
    expect(optionalClearableTrimmedString.parse("   ")).toBeNull();
    expect(optionalClearableTrimmedString.parse(null)).toBeNull();
    expect(optionalClearableTrimmedString.parse(undefined)).toBeUndefined();
  });

  it("trims required string arrays and rejects empty arrays", () => {
    expect(trimmedRequiredStringArray.parse([" one ", " two "])).toEqual([
      "one",
      "two"
    ]);
    expect(() => trimmedRequiredStringArray.parse([])).toThrow();
  });
});

describe("URL schema helpers", () => {
  it("accepts optional trimmed URL strings", () => {
    expect(optionalTrimmedUrlString.parse(" https://example.com/a ")).toBe(
      "https://example.com/a"
    );
    expect(optionalTrimmedUrlString.parse(undefined)).toBeUndefined();
  });

  it("rejects non-HTTP URLs when HTTP is required", () => {
    const schema = createTrimmedHttpUrlString();

    expect(schema.parse(" https://example.com ")).toBe("https://example.com");
    expect(schema.parse(" http://example.com ")).toBe("http://example.com");
    expect(() => schema.parse("ftp://example.com")).toThrow();
  });
});
