import { describe, expect, it } from "vitest";

import { getTodayDateInputValue, isDateInputValue } from "./dateInputValue";

describe("date input value helpers", () => {
  it("formats the local date as an HTML date input value", () => {
    expect(getTodayDateInputValue(new Date(2026, 4, 5))).toBe("2026-05-05");
  });

  it("validates real YYYY-MM-DD calendar dates", () => {
    expect(isDateInputValue("2024-02-29")).toBe(true);
    expect(isDateInputValue(" 2026-05-05 ")).toBe(true);
    expect(isDateInputValue("2026-02-29")).toBe(false);
    expect(isDateInputValue("2026-13-01")).toBe(false);
    expect(isDateInputValue("05/05/2026")).toBe(false);
  });
});
