import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GlassButtonLink } from "./GlassButtonLink";

afterEach(() => {
  document
    .querySelectorAll('[data-slot="hero-black-hole-image"]')
    .forEach((element) => element.remove());
  vi.restoreAllMocks();
});

describe("GlassButtonLink", () => {
  it("renders a proper link with the glass button styling", () => {
    render(
      <GlassButtonLink
        href="/resume.pdf"
        icon={<span data-testid="glass-button-link-test-icon">+</span>}
      >
        Resume
      </GlassButtonLink>
    );

    const link = screen.getByRole("link", { name: "Resume" });
    const icon = screen.getByTestId("glass-button-link-test-icon");
    const label = screen.getByText("Resume");

    expect(link).toHaveAttribute("href", "/resume.pdf");
    expect(link).toHaveAttribute("data-slot", "glass-button-link");
    expect(link).toHaveClass(
      "portfolio-glass-button",
      "portfolio-glass-button--primary"
    );
    expect(icon.closest("[data-slot='glass-button-icon']")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
    expect(icon.compareDocumentPosition(label)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it("supports the secondary variant", () => {
    render(
      <GlassButtonLink href="/projects" variant="secondary">
        View projects
      </GlassButtonLink>
    );

    expect(screen.getByRole("link", { name: "View projects" })).toHaveClass(
      "portfolio-glass-button--secondary"
    );
  });

  it("supports the large size", () => {
    render(
      <GlassButtonLink href="/projects" size="large">
        View projects
      </GlassButtonLink>
    );

    expect(screen.getByRole("link", { name: "View projects" })).toHaveClass(
      "portfolio-glass-button--large"
    );
  });

  it("sets accent variables toward the hero black hole image", () => {
    const blackHoleImage = document.createElement("div");
    blackHoleImage.dataset.slot = "hero-black-hole-image";
    document.body.append(blackHoleImage);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function getMockRect(this: HTMLElement) {
        if (this.dataset.slot === "hero-black-hole-image") {
          return createRect({ height: 20, left: 140, top: 300, width: 20 });
        }

        if (this.dataset.slot === "glass-button-link") {
          return createRect({ height: 50, left: 100, top: 100, width: 100 });
        }

        return createRect({ height: 0, left: 0, top: 0, width: 0 });
      }
    );

    render(<GlassButtonLink href="/track">Track</GlassButtonLink>);

    const link = screen.getByRole("link", { name: "Track" });

    expect(
      link.style.getPropertyValue("--portfolio-glass-button-accent-angle")
    ).toBe("180deg");
    expect(
      link.style.getPropertyValue("--portfolio-glass-button-glow-boost-alpha")
    ).toBe("0");
    expect(
      link.style.getPropertyValue("--portfolio-glass-button-glow-shadow-x")
    ).toBe("0");
    expect(
      link.style.getPropertyValue("--portfolio-glass-button-glow-shadow-y")
    ).toBe("1");
    expect(
      link.style.getPropertyValue("--portfolio-glass-button-glow-strength")
    ).toBe("1");
  });
});

function createRect({
  height,
  left,
  top,
  width
}: Pick<DOMRect, "height" | "left" | "top" | "width">) {
  return {
    bottom: top + height,
    height,
    left,
    right: left + width,
    toJSON: () => ({}),
    top,
    width,
    x: left,
    y: top
  } as DOMRect;
}
