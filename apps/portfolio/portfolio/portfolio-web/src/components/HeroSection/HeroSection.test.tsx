import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeroSection } from "./HeroSection";

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
});
