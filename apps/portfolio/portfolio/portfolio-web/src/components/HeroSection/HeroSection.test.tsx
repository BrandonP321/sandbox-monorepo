import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HeroSection } from "./HeroSection";
import { getBlackHoleParallaxCenterY } from "./parallax";

const originalMatchMedia = window.matchMedia;

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

describe("HeroSection", () => {
  it("renders the hero title and description", () => {
    render(
      <HeroSection
        description="Building analysis tools, policy workflows, and pragmatic product systems."
        title="Brandon Phillips"
      />
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Brandon Phillips" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Building analysis tools, policy workflows, and pragmatic product systems."
      )
    ).toBeInTheDocument();
  });

  it("renders large hero action buttons", () => {
    render(
      <HeroSection description="Portfolio introduction." title="Portfolio" />
    );

    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveClass(
      "portfolio-glass-button--large"
    );
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveClass(
      "portfolio-glass-button--large"
    );
  });

  it("keeps the black hole graphic decorative", () => {
    const { container } = render(
      <HeroSection description="Portfolio introduction." title="Portfolio" />
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="hero-black-hole"]')
    ).toHaveAttribute("aria-hidden", "true");
    expect(
      container.querySelector('[data-slot="hero-black-hole-image"]')
    ).toBeInTheDocument();
  });

  it("uses a small-screen low-res black hole image while the full-res image loads", () => {
    setMatchMedia(true);

    const { container } = render(
      <HeroSection description="Portfolio introduction." title="Portfolio" />
    );

    const blackHoleImage = container.querySelector(
      '[data-slot="hero-black-hole-image"]'
    );

    expect(blackHoleImage).toHaveAttribute(
      "src",
      expect.stringContaining("purple-blackhole-mobile-low-res.jpg")
    );
  });

  it("supports a caller-provided class name", () => {
    const { container } = render(
      <HeroSection
        className="portfolio-home-hero"
        description="Portfolio introduction."
        title="Portfolio"
      />
    );

    expect(container.firstElementChild).toHaveClass("portfolio-home-hero");
  });

  it("uses the nearest portfolio scroll container for parallax", () => {
    const { container } = render(
      <main data-slot="portfolio-scroll-container">
        <HeroSection description="Portfolio introduction." title="Portfolio" />
      </main>
    );
    const scrollContainer = container.querySelector(
      '[data-slot="portfolio-scroll-container"]'
    ) as HTMLElement;
    const blackHole = container.querySelector(
      '[data-slot="hero-black-hole"]'
    ) as HTMLElement;

    Object.defineProperties(scrollContainer, {
      clientHeight: { configurable: true, value: 1000 },
      scrollHeight: { configurable: true, value: 3000 },
      scrollTop: { configurable: true, value: 1000 }
    });

    fireEvent.scroll(scrollContainer);

    expect(
      blackHole.style.getPropertyValue("--portfolio-black-hole-center-y")
    ).toBe("500px");
  });

  it("maps black hole parallax from the viewport bottom to the viewport top", () => {
    const metrics = {
      scrollHeight: 3000,
      viewportHeight: 1000
    };

    expect(getBlackHoleParallaxCenterY({ ...metrics, scrollY: 0 })).toBeCloseTo(
      1000
    );
    expect(
      getBlackHoleParallaxCenterY({ ...metrics, scrollY: 1000 })
    ).toBeCloseTo(500);
    expect(
      getBlackHoleParallaxCenterY({ ...metrics, scrollY: 2000 })
    ).toBeCloseTo(0);
  });

  it("clamps black hole parallax outside the scroll range", () => {
    const metrics = {
      scrollHeight: 3000,
      viewportHeight: 1000
    };

    expect(
      getBlackHoleParallaxCenterY({ ...metrics, scrollY: -100 })
    ).toBeCloseTo(1000);
    expect(
      getBlackHoleParallaxCenterY({ ...metrics, scrollY: 2400 })
    ).toBeCloseTo(0);
    expect(
      getBlackHoleParallaxCenterY({
        scrollHeight: 800,
        scrollY: 0,
        viewportHeight: 1000
      })
    ).toBeCloseTo(1000);
  });
});
