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

  it("recognizes complete Irish and UK numbers entered without a plus", () => {
    expect(formatPhoneNumberInput("353 21 234 5678")).toBe("+353 21 234 5678");
    expect(formatPhoneNumberInput("353212345678")).toBe("+353 21 234 5678");
    expect(formatPhoneNumberInput("44 20 7946 0018")).toBe("+44 20 7946 0018");
    expect(formatPhoneNumberInput("442079460018")).toBe("+44 20 7946 0018");
  });

  it("recognizes the international 00 dialing prefix", () => {
    expect(formatPhoneNumberInput("00353 21 234 5678")).toBe(
      "+353 21 234 5678"
    );
  });

  it("does not reinterpret a ten-digit US number with a 353 area code", () => {
    expect(formatPhoneNumberInput("3535550123")).toBe("(353) 555-0123");
  });

  it("keeps an empty input empty", () => {
    expect(formatPhoneNumberInput("")).toBe("");
  });
});
