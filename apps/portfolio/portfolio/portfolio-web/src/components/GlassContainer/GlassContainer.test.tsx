import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GlassContainer } from "./GlassContainer";

describe("GlassContainer", () => {
  it("renders children in the portfolio glass container", () => {
    render(
      <GlassContainer>
        <h2>Featured work</h2>
      </GlassContainer>
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Featured work" })
    ).toBeInTheDocument();
    expect(screen.getByText("Featured work").parentElement).toHaveAttribute(
      "data-slot",
      "glass-container"
    );
  });

  it("supports a caller-provided class name", () => {
    const { container } = render(
      <GlassContainer className="portfolio-feature-panel">
        Panel content
      </GlassContainer>
    );

    expect(container.firstElementChild).toHaveClass(
      "portfolio-glass-container",
      "portfolio-feature-panel"
    );
  });
});
