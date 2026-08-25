import { describe, expect, it } from "vitest";

import { formatPhoneNumberInput } from "./phoneNumber";

describe("formatPhoneNumberInput", () => {
  it("formats US phone numbers as they are entered", () => {
    expect(formatPhoneNumberInput("4155550")).toBe("(415) 555-0");
    expect(formatPhoneNumberInput("4155550123")).toBe("(415) 555-0123");
  });

  it("preserves an international prefix and applies international formatting", () => {
    expect(formatPhoneNumberInput("+442079460018")).toBe("+44 20 7946 0018");
  });

  it("keeps an empty input empty", () => {
    expect(formatPhoneNumberInput("")).toBe("");
  });
});
