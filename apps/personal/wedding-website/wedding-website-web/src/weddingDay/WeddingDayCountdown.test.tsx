import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getWeddingDaysRemaining } from "./getWeddingDaysRemaining";
import { WeddingDayCountdown } from "./WeddingDayCountdown";

describe("Los Angeles wedding calendar", () => {
  it.each([
    ["2026-10-02T07:00:00Z", 323],
    ["2027-08-20T06:59:59.999Z", 2],
    ["2027-08-20T07:00:00Z", 1],
    ["2027-08-21T06:59:59.999Z", 1],
    ["2027-08-21T07:00:00Z", 0],
    ["2027-08-22T06:59:59.999Z", 0],
    ["2027-08-22T07:00:00Z", -1],
    ["2027-03-14T07:59:59.999Z", 161],
    ["2027-03-14T08:00:00Z", 160],
    ["2027-03-14T09:59:59.999Z", 160],
    ["2027-03-14T10:00:00Z", 160],
    ["2027-03-15T07:00:00Z", 159],
    ["2026-11-01T06:59:59.999Z", 294],
    ["2026-11-01T07:00:00Z", 293],
    ["2026-11-01T08:59:59.999Z", 293],
    ["2026-11-01T09:00:00Z", 293],
    ["2026-11-02T08:00:00Z", 292]
  ])("counts calendar days at %s", (instant, expected) => {
    expect(getWeddingDaysRemaining(new Date(instant))).toBe(expected);
  });
});

describe("WeddingDayCountdown", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it.each([
    ["2027-08-19T12:00:00Z", "2 DAYS TO GO"],
    ["2027-08-20T12:00:00Z", "1 DAY TO GO"],
    ["2027-08-21T12:00:00Z", "Today’s the day!"],
    ["2027-08-22T12:00:00Z", "Just married!"]
  ])("renders readable text at %s without live announcements", (now, copy) => {
    vi.setSystemTime(new Date(now));
    const { container } = render(<WeddingDayCountdown />);
    expect(screen.getByRole("paragraph")).toHaveTextContent(copy);
    expect(container.querySelector("[aria-live], [role='status']")).toBeNull();
  });

  it.each([
    ["2027-08-21T06:59:59.500Z", "1 DAY TO GO", "Today’s the day!"],
    ["2027-08-22T06:59:59.500Z", "Today’s the day!", "Just married!"],
    ["2027-03-15T06:59:59.500Z", "160 DAYS TO GO", "159 DAYS TO GO"],
    ["2026-11-02T07:59:59.500Z", "293 DAYS TO GO", "292 DAYS TO GO"]
  ])("refreshes at LA midnight from %s", (now, before, after) => {
    vi.setSystemTime(new Date(now));
    render(<WeddingDayCountdown />);
    expect(screen.getByRole("paragraph")).toHaveTextContent(before);
    act(() => vi.advanceTimersByTime(500));
    expect(screen.getByRole("paragraph")).toHaveTextContent(after);
  });

  it.each(["focus", "pageshow", "visibilitychange"])(
    "recovers after sleep on %s and cleans up on unmount",
    (event) => {
      vi.setSystemTime(new Date("2027-08-20T12:00:00Z"));
      vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
      const { unmount } = render(<WeddingDayCountdown />);
      vi.setSystemTime(new Date("2027-08-22T12:00:00Z"));
      const target = event === "visibilitychange" ? document : window;
      act(() => target.dispatchEvent(new Event(event)));
      expect(screen.getByRole("paragraph")).toHaveTextContent("Just married!");
      expect(vi.getTimerCount()).toBe(1);
      unmount();
      act(() => target.dispatchEvent(new Event(event)));
      expect(vi.getTimerCount()).toBe(0);
    }
  );
});
