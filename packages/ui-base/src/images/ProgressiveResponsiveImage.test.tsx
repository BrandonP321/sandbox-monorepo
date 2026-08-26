// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProgressiveResponsiveImage } from "./ProgressiveResponsiveImage";
import type { ProgressiveResponsiveImageSource } from "./ProgressiveResponsiveImage";

const originalMatchMedia = window.matchMedia;

const imageSources = [
  {
    media: "(max-width: 720px)",
    lowResSrc: "/mobile-low.jpg",
    src: "/mobile-full.jpg"
  },
  {
    lowResSrc: "/desktop-low.jpg",
    src: "/desktop-full.jpg"
  }
] satisfies [
  ProgressiveResponsiveImageSource,
  ...ProgressiveResponsiveImageSource[]
];

function createDeferredImageLoad() {
  let resolveCurrentLoad: () => void = () => {};
  const loadImage = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        resolveCurrentLoad = resolve;
      })
  );

  return {
    loadImage,
    resolveLoad: () => {
      resolveCurrentLoad();
    }
  };
}

function installMatchMediaMock(initialMatches: Record<string, boolean>) {
  const listeners = new Map<string, Set<() => void>>();
  const matches = new Map(Object.entries(initialMatches));

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn((media: string) => {
      const mediaListeners = listeners.get(media) ?? new Set<() => void>();

      listeners.set(media, mediaListeners);

      return {
        addEventListener: vi.fn((eventName: string, listener: () => void) => {
          if (eventName === "change") {
            mediaListeners.add(listener);
          }
        }),
        get matches() {
          return matches.get(media) ?? false;
        },
        media,
        removeEventListener: vi.fn(
          (eventName: string, listener: () => void) => {
            if (eventName === "change") {
              mediaListeners.delete(listener);
            }
          }
        )
      };
    })
  });

  return {
    setMatches: (media: string, isMatch: boolean) => {
      matches.set(media, isMatch);
      listeners.get(media)?.forEach((listener) => listener());
    }
  };
}

afterEach(() => {
  cleanup();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: originalMatchMedia
  });
});

describe("ProgressiveResponsiveImage", () => {
  it("renders the low-resolution image before the full-resolution image is loaded", () => {
    const { loadImage } = createDeferredImageLoad();

    render(
      <ProgressiveResponsiveImage
        alt="Black hole"
        loadImage={loadImage}
        sources={imageSources}
      />
    );

    const image = screen.getByRole("img", { name: "Black hole" });

    expect(image.getAttribute("src")).toBe("/desktop-low.jpg");
    expect(image.getAttribute("data-image-resolution")).toBe("low-res");
    expect(loadImage).toHaveBeenCalledWith("/desktop-full.jpg");
  });

  it("swaps to the full-resolution image only after it has loaded", async () => {
    const { loadImage, resolveLoad } = createDeferredImageLoad();

    render(
      <ProgressiveResponsiveImage
        alt="Black hole"
        loadImage={loadImage}
        sources={imageSources}
      />
    );

    const image = screen.getByRole("img", { name: "Black hole" });

    resolveLoad();

    await waitFor(() => {
      expect(image.getAttribute("src")).toBe("/desktop-full.jpg");
      expect(image.getAttribute("data-image-resolution")).toBe("full-res");
    });
  });

  it("renders a source without a preview directly and skips duplicate preloading", () => {
    const loadImage = vi.fn(() => Promise.resolve());

    render(
      <ProgressiveResponsiveImage
        alt="Small illustration"
        loadImage={loadImage}
        sources={[{ src: "/small.png" }]}
      />
    );

    const image = screen.getByRole("img", { name: "Small illustration" });

    expect(image.getAttribute("src")).toBe("/small.png");
    expect(image.getAttribute("data-image-resolution")).toBe("full-res");
    expect(loadImage).not.toHaveBeenCalled();
  });

  it("updates when a responsive source starts matching", () => {
    const { loadImage } = createDeferredImageLoad();
    const { setMatches } = installMatchMediaMock({
      "(max-width: 720px)": false
    });

    render(
      <ProgressiveResponsiveImage
        alt="Black hole"
        loadImage={loadImage}
        sources={imageSources}
      />
    );

    const image = screen.getByRole("img", { name: "Black hole" });

    expect(image.getAttribute("src")).toBe("/desktop-low.jpg");

    act(() => {
      setMatches("(max-width: 720px)", true);
    });

    expect(image.getAttribute("src")).toBe("/mobile-low.jpg");
    expect(loadImage).toHaveBeenCalledWith("/mobile-full.jpg");
  });
});
