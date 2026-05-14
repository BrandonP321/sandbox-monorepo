import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeroSection } from "./HeroSection";
import { getBlackHoleParallaxCenterY } from "./parallax";

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

  it("keeps the black hole graphic decorative", () => {
    const { container } = render(
      <HeroSection description="Portfolio introduction." title="Portfolio" />
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="hero-black-hole"]')
    ).toHaveAttribute("aria-hidden", "true");
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
