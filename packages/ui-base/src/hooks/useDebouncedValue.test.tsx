// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useDebouncedValue } from "./useDebouncedValue";

describe("useDebouncedValue", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the latest value only after the debounce delay", () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ delayMs, value }: { delayMs: number; value: string }) =>
        useDebouncedValue(value, delayMs),
      {
        initialProps: {
          delayMs: 250,
          value: "initial"
        }
      }
    );

    expect(result.current).toBe("initial");

    rerender({
      delayMs: 250,
      value: "updated"
    });

    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(249);
    });

    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe("updated");
  });

  it("cancels an outdated pending value when a newer value arrives", () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ delayMs, value }: { delayMs: number; value: string }) =>
        useDebouncedValue(value, delayMs),
      {
        initialProps: {
          delayMs: 250,
          value: "initial"
        }
      }
    );

    rerender({
      delayMs: 250,
      value: "first update"
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({
      delayMs: 250,
      value: "second update"
    });

    act(() => {
      vi.advanceTimersByTime(249);
    });

    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe("second update");
  });
});
