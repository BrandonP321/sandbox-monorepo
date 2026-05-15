import { render, screen, waitFor } from "@testing-library/react";
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

function setMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn((media: string) => ({
      addEventListener: vi.fn(),
      matches,
      media,
      removeEventListener: vi.fn()
    }))
  });
}

afterEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: originalMatchMedia
  });
});

describe("ProgressiveResponsiveImage", () => {
  it("renders the selected low-res image before the full-res image is loaded", () => {
    const { loadImage } = createDeferredImageLoad();

    render(
      <ProgressiveResponsiveImage
        alt="Black hole"
        loadImage={loadImage}
        sources={imageSources}
      />
    );

    const image = screen.getByRole("img", { name: "Black hole" });

    expect(image).toHaveAttribute("src", "/desktop-low.jpg");
    expect(image).toHaveAttribute("data-image-resolution", "low-res");
    expect(loadImage).toHaveBeenCalledWith("/desktop-full.jpg");
  });

  it("swaps to the full-res image only after it has loaded", async () => {
    const { loadImage, resolveLoad } = createDeferredImageLoad();

    render(
      <ProgressiveResponsiveImage
        alt="Black hole"
        loadImage={loadImage}
        sources={imageSources}
      />
    );

    const image = screen.getByRole("img", { name: "Black hole" });

    expect(image).toHaveAttribute("src", "/desktop-low.jpg");

    resolveLoad();

    await waitFor(() => {
      expect(image).toHaveAttribute("src", "/desktop-full.jpg");
      expect(image).toHaveAttribute("data-image-resolution", "full-res");
    });
  });

  it("uses the matching responsive source", () => {
    const { loadImage } = createDeferredImageLoad();

    setMatchMedia(true);

    render(
      <ProgressiveResponsiveImage
        alt="Black hole"
        loadImage={loadImage}
        sources={imageSources}
      />
    );

    expect(screen.getByRole("img", { name: "Black hole" })).toHaveAttribute(
      "src",
      "/mobile-low.jpg"
    );
    expect(loadImage).toHaveBeenCalledWith("/mobile-full.jpg");
  });
});
