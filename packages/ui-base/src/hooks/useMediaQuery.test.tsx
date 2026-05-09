// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useMediaQuery } from "./useMediaQuery";
import { useMinBreakpoint } from "./useMinBreakpoint";

type MockMediaQueryList = MediaQueryList & {
  readonly listenerCount: number;
  setMatches(matches: boolean): void;
};

const originalMatchMedia = window.matchMedia;

function createMediaQueryEvent(
  mediaQueryList: MediaQueryList
): MediaQueryListEvent {
  return {
    matches: mediaQueryList.matches,
    media: mediaQueryList.media
  } as MediaQueryListEvent;
}

function installMatchMediaMock(initialMatches: Record<string, boolean> = {}) {
  const mediaQueryLists = new Map<string, MockMediaQueryList>();

  const matchMedia = vi.fn((query: string): MediaQueryList => {
    const existingMediaQueryList = mediaQueryLists.get(query);

    if (existingMediaQueryList) {
      return existingMediaQueryList;
    }

    const listeners = new Set<EventListenerOrEventListenerObject>();
    let currentMatches = initialMatches[query] ?? false;
    const mediaQueryList = {
      get matches() {
        return currentMatches;
      },
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(
        (
          eventName: string,
          listener: EventListenerOrEventListenerObject | null
        ) => {
          if (eventName === "change" && listener) {
            listeners.add(listener);
          }
        }
      ),
      removeEventListener: vi.fn(
        (
          eventName: string,
          listener: EventListenerOrEventListenerObject | null
        ) => {
          if (eventName === "change" && listener) {
            listeners.delete(listener);
          }
        }
      ),
      dispatchEvent: vi.fn(() => true),
      get listenerCount() {
        return listeners.size;
      },
      setMatches(matches: boolean) {
        currentMatches = matches;
        const event = createMediaQueryEvent(this);

        for (const listener of Array.from(listeners)) {
          if (typeof listener === "function") {
            listener.call(this, event);
          } else {
            listener.handleEvent(event);
          }
        }

        this.onchange?.(event);
      }
    } satisfies MockMediaQueryList;

    mediaQueryLists.set(query, mediaQueryList);

    return mediaQueryList;
  });

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: matchMedia
  });

  return {
    getMediaQueryList: (query: string): MockMediaQueryList => {
      const mediaQueryList = mediaQueryLists.get(query);

      if (!mediaQueryList) {
        throw new Error(`No MediaQueryList was created for ${query}`);
      }

      return mediaQueryList;
    },
    matchMedia
  };
}

afterEach(() => {
  cleanup();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: originalMatchMedia
  });
});

describe("useMediaQuery", () => {
  it("returns the current MediaQueryList match value", () => {
    installMatchMediaMock({
      "(min-width: 48rem)": true
    });

    const { result } = renderHook(() => useMediaQuery("(min-width: 48rem)"));

    expect(result.current).toBe(true);
  });

  it("updates when the media query change event fires", () => {
    const { getMediaQueryList } = installMatchMediaMock({
      "(min-width: 64rem)": false
    });

    const { result } = renderHook(() => useMediaQuery("(min-width: 64rem)"));

    expect(result.current).toBe(false);

    act(() => {
      getMediaQueryList("(min-width: 64rem)").setMatches(true);
    });

    expect(result.current).toBe(true);
  });

  it("shares one change listener for consumers using the same query", () => {
    const { getMediaQueryList } = installMatchMediaMock();

    const firstRender = renderHook(() => useMediaQuery("(min-width: 80rem)"));
    const secondRender = renderHook(() => useMediaQuery("(min-width: 80rem)"));
    const mediaQueryList = getMediaQueryList("(min-width: 80rem)");

    expect(mediaQueryList.addEventListener).toHaveBeenCalledTimes(1);
    expect(mediaQueryList.listenerCount).toBe(1);

    firstRender.unmount();
    secondRender.unmount();
  });

  it("keeps the shared listener until the final same-query consumer unmounts", () => {
    const { getMediaQueryList } = installMatchMediaMock();

    const firstRender = renderHook(() => useMediaQuery("(min-width: 80rem)"));
    const secondRender = renderHook(() => useMediaQuery("(min-width: 80rem)"));
    const mediaQueryList = getMediaQueryList("(min-width: 80rem)");

    firstRender.unmount();

    expect(mediaQueryList.removeEventListener).not.toHaveBeenCalled();
    expect(mediaQueryList.listenerCount).toBe(1);

    secondRender.unmount();

    expect(mediaQueryList.removeEventListener).toHaveBeenCalledTimes(1);
    expect(mediaQueryList.listenerCount).toBe(0);

    renderHook(() => useMediaQuery("(min-width: 80rem)")).unmount();

    expect(mediaQueryList.addEventListener).toHaveBeenCalledTimes(2);
  });

  it("keeps different media query strings isolated", () => {
    const { getMediaQueryList } = installMatchMediaMock({
      "(min-width: 40rem)": true,
      "(min-width: 96rem)": false
    });

    const smallRender = renderHook(() => useMediaQuery("(min-width: 40rem)"));
    const wideRender = renderHook(() => useMediaQuery("(min-width: 96rem)"));
    const smallMediaQueryList = getMediaQueryList("(min-width: 40rem)");
    const wideMediaQueryList = getMediaQueryList("(min-width: 96rem)");

    expect(smallRender.result.current).toBe(true);
    expect(wideRender.result.current).toBe(false);
    expect(smallMediaQueryList.addEventListener).toHaveBeenCalledTimes(1);
    expect(wideMediaQueryList.addEventListener).toHaveBeenCalledTimes(1);

    act(() => {
      wideMediaQueryList.setMatches(true);
    });

    expect(smallRender.result.current).toBe(true);
    expect(wideRender.result.current).toBe(true);

    smallRender.unmount();
    wideRender.unmount();
  });

  it("uses the SSR fallback when matchMedia is unavailable", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: undefined
    });

    const defaultFallback = renderHook(() =>
      useMediaQuery("(min-width: 1rem)")
    );
    const explicitFallback = renderHook(() =>
      useMediaQuery("(min-width: 1rem)", { ssrMatch: true })
    );

    expect(defaultFallback.result.current).toBe(false);
    expect(explicitFallback.result.current).toBe(true);
  });
});

describe("useMinBreakpoint", () => {
  it("uses Tailwind-aligned min-width media queries", () => {
    const { matchMedia } = installMatchMediaMock();
    const breakpoints = [
      ["sm", "(min-width: 40rem)"],
      ["md", "(min-width: 48rem)"],
      ["lg", "(min-width: 64rem)"],
      ["xl", "(min-width: 80rem)"],
      ["2xl", "(min-width: 96rem)"]
    ] satisfies Array<[Parameters<typeof useMinBreakpoint>[0], string]>;

    for (const [breakpoint, query] of breakpoints) {
      const { unmount } = renderHook(() => useMinBreakpoint(breakpoint));

      expect(matchMedia).toHaveBeenCalledWith(query);

      unmount();
    }
  });
});
