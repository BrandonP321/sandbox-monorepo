import { readFileSync } from "node:fs";

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GlassButton } from "./GlassButton";
import { getBlackHoleAccentPosition } from "./blackHoleAccent";

afterEach(() => {
  document
    .querySelectorAll('[data-slot="hero-black-hole-image"]')
    .forEach((element) => element.remove());
  vi.restoreAllMocks();
});

describe("GlassButton", () => {
  it("renders the icon before the text label", () => {
    render(
      <GlassButton icon={<span data-testid="glass-button-test-icon">+</span>}>
        Contact
      </GlassButton>
    );

    const button = screen.getByRole("button", { name: "Contact" });
    const icon = screen.getByTestId("glass-button-test-icon");
    const label = screen.getByText("Contact");

    expect(button).toHaveAttribute("type", "button");
    expect(icon.closest("[data-slot='glass-button-icon']")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
    expect(button.compareDocumentPosition(icon)).toBe(
      Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(icon.compareDocumentPosition(label)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it("supports primary and secondary variants", () => {
    const { rerender } = render(
      <GlassButton variant="secondary">View work</GlassButton>
    );

    expect(screen.getByRole("button", { name: "View work" })).toHaveClass(
      "portfolio-glass-button--secondary"
    );
    expect(
      screen
        .getByRole("button", { name: "View work" })
        .querySelector("[data-slot='glass-button-icon']")
    ).not.toBeInTheDocument();

    rerender(<GlassButton variant="primary">View work</GlassButton>);

    expect(screen.getByRole("button", { name: "View work" })).toHaveClass(
      "portfolio-glass-button--primary"
    );
  });

  it("supports disabled button state", () => {
    render(
      <GlassButton disabled icon={<span>+</span>}>
        Contact
      </GlassButton>
    );

    expect(screen.getByRole("button", { name: "Contact" })).toBeDisabled();
  });

  it("keeps secondary icons aligned with the text color instead of the accent", () => {
    const css = readFileSync("src/index.css", "utf8");

    expect(css).toMatch(
      /\.portfolio-glass-button__icon\s*{[\s\S]*color: var\(--portfolio-glass-button-icon-color\);/
    );
    expect(css).toMatch(
      /\.portfolio-glass-button--secondary\s*{[\s\S]*--portfolio-glass-button-icon-color: color-mix\([\s\S]*currentColor 72%,/
    );
    expect(css).toMatch(
      /\.portfolio-glass-button--secondary\s*{[\s\S]*--portfolio-glass-button-icon-hover-color: currentColor;/
    );
    expect(css).toMatch(
      /\.portfolio-glass-button:not\(:disabled\):hover \.portfolio-glass-button__icon\s*{[\s\S]*color: var\(--portfolio-glass-button-icon-hover-color\);/
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

        if (this.dataset.slot === "glass-button") {
          return createRect({ height: 50, left: 100, top: 100, width: 100 });
        }

        return createRect({ height: 0, left: 0, top: 0, width: 0 });
      }
    );

    render(<GlassButton>Track</GlassButton>);

    const button = screen.getByRole("button", { name: "Track" });

    expect(
      button.style.getPropertyValue("--portfolio-glass-button-accent-angle")
    ).toBe("180deg");
    expect(
      button.style.getPropertyValue("--portfolio-glass-button-glow-boost-alpha")
    ).toBe("0");
    expect(
      button.style.getPropertyValue("--portfolio-glass-button-glow-shadow-x")
    ).toBe("0");
    expect(
      button.style.getPropertyValue("--portfolio-glass-button-glow-shadow-y")
    ).toBe("1");
    expect(
      button.style.getPropertyValue("--portfolio-glass-button-glow-strength")
    ).toBe("1");
  });

  it("boosts the glow strength as the black hole gets closer", () => {
    const blackHoleImage = document.createElement("div");
    blackHoleImage.dataset.slot = "hero-black-hole-image";
    document.body.append(blackHoleImage);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function getMockRect(this: HTMLElement) {
        if (this.dataset.slot === "hero-black-hole-image") {
          return createRect({ height: 20, left: 140, top: 115, width: 20 });
        }

        if (this.dataset.slot === "glass-button") {
          return createRect({ height: 50, left: 100, top: 100, width: 100 });
        }

        return createRect({ height: 0, left: 0, top: 0, width: 0 });
      }
    );

    render(<GlassButton>Track</GlassButton>);

    const button = screen.getByRole("button", { name: "Track" });

    expect(
      button.style.getPropertyValue("--portfolio-glass-button-glow-boost-alpha")
    ).toBe("0.42");
    expect(
      button.style.getPropertyValue("--portfolio-glass-button-glow-strength")
    ).toBe("3");
  });

  it("calculates the accent angle facing the black hole", () => {
    const bottomAccent = getBlackHoleAccentPosition({
      buttonRect: createRect({ height: 50, left: 100, top: 100, width: 100 }),
      targetRect: createRect({ height: 20, left: 140, top: 300, width: 20 })
    });
    const rightAccent = getBlackHoleAccentPosition({
      buttonRect: createRect({ height: 50, left: 100, top: 100, width: 100 }),
      targetRect: createRect({ height: 20, left: 315, top: 115, width: 20 })
    });

    expect(bottomAccent).toMatchObject({
      angleDegrees: 180,
      glowBoostProgress: 0,
      glowShadowX: 0,
      glowShadowY: 1,
      glowStrength: 1
    });
    expect(rightAccent).toMatchObject({
      angleDegrees: 90,
      glowBoostProgress: 0,
      glowShadowX: 1,
      glowShadowY: 0,
      glowStrength: 1
    });
  });

  it("calculates maximum glow strength when the black hole is closest", () => {
    expect(
      getBlackHoleAccentPosition({
        buttonRect: createRect({ height: 50, left: 100, top: 100, width: 100 }),
        targetRect: createRect({ height: 20, left: 140, top: 115, width: 20 })
      })
    ).toMatchObject({
      glowBoostProgress: 1,
      glowShadowX: 0,
      glowShadowY: 1,
      glowStrength: 3
    });
  });

  it("increases glow strength as the black hole image approaches the button", () => {
    const approachingAccent = getBlackHoleAccentPosition({
      buttonRect: createRect({ height: 50, left: 100, top: 100, width: 100 }),
      targetRect: createRect({ height: 20, left: 140, top: 205, width: 20 })
    });

    expect(approachingAccent?.glowBoostProgress).toBeGreaterThan(0);
    expect(approachingAccent?.glowBoostProgress).toBeLessThan(1);
    expect(approachingAccent?.glowStrength).toBeGreaterThan(1);
    expect(approachingAccent?.glowStrength).toBeLessThan(3);
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
