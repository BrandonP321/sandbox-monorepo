import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { StickyNav } from "./StickyNav";
import type { StickyNavItem } from "./StickyNav";

const navItems = [
  { href: "#intro", label: "Intro" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" }
] satisfies [StickyNavItem, ...StickyNavItem[]];

afterEach(() => {
  vi.restoreAllMocks();
});

describe("StickyNav", () => {
  it("renders portfolio section links", () => {
    render(<StickyNav items={navItems} />);

    expect(
      screen.getByRole("navigation", { name: "Portfolio sections" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Intro" })).toHaveAttribute(
      "href",
      "#intro"
    );
    expect(screen.getByRole("link", { name: "Experience" })).toHaveAttribute(
      "href",
      "#experience"
    );
  });

  it("positions the slider under the hovered link", () => {
    mockNavRects();
    render(<StickyNav items={navItems} />);

    const nav = screen.getByRole("navigation", {
      name: "Portfolio sections"
    });

    fireEvent.mouseEnter(screen.getByRole("link", { name: "Experience" }));

    expect(nav).toHaveAttribute("data-slider-visible", "true");
    expect(nav).toHaveAttribute("data-slider-motion", "false");
    expect(
      nav.style.getPropertyValue("--portfolio-sticky-nav-slider-left")
    ).toBe("90px");
    expect(
      nav.style.getPropertyValue("--portfolio-sticky-nav-slider-top")
    ).toBe("4px");
    expect(
      nav.style.getPropertyValue("--portfolio-sticky-nav-slider-width")
    ).toBe("112px");
    expect(
      nav.style.getPropertyValue("--portfolio-sticky-nav-slider-height")
    ).toBe("42px");
  });

  it("only enables position transitions while moving between hovered links", () => {
    mockNavRects();
    render(<StickyNav items={navItems} />);

    const nav = screen.getByRole("navigation", {
      name: "Portfolio sections"
    });

    fireEvent.mouseEnter(screen.getByRole("link", { name: "Experience" }));
    fireEvent.mouseEnter(screen.getByRole("link", { name: "Projects" }));

    expect(nav).toHaveAttribute("data-slider-visible", "true");
    expect(nav).toHaveAttribute("data-slider-motion", "true");
    expect(
      nav.style.getPropertyValue("--portfolio-sticky-nav-slider-left")
    ).toBe("202px");
    expect(
      nav.style.getPropertyValue("--portfolio-sticky-nav-slider-width")
    ).toBe("90px");
  });

  it("hides the slider after leaving the nav", () => {
    mockNavRects();
    render(<StickyNav items={navItems} />);

    const nav = screen.getByRole("navigation", {
      name: "Portfolio sections"
    });

    fireEvent.mouseEnter(screen.getByRole("link", { name: "Projects" }));
    fireEvent.mouseLeave(nav);

    expect(nav).toHaveAttribute("data-slider-visible", "false");
    expect(nav).toHaveAttribute("data-slider-motion", "false");
    expect(
      nav.style.getPropertyValue("--portfolio-sticky-nav-slider-left")
    ).toBe("202px");
    expect(
      nav.style.getPropertyValue("--portfolio-sticky-nav-slider-width")
    ).toBe("90px");
  });
});

function mockNavRects() {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function getMockRect(this: HTMLElement) {
      if (this.dataset.slot === "sticky-nav") {
        return createRect({ height: 50, left: 100, top: 20, width: 320 });
      }

      if (this.textContent === "Experience") {
        return createRect({ height: 42, left: 190, top: 24, width: 112 });
      }

      if (this.textContent === "Projects") {
        return createRect({ height: 42, left: 302, top: 24, width: 90 });
      }

      return createRect({ height: 42, left: 110, top: 24, width: 80 });
    }
  );
}

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
