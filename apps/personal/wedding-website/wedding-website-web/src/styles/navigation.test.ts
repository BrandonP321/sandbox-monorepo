import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const navigationCss = fs.readFileSync(
  path.join(process.cwd(), "src/styles/navigation.css"),
  "utf8"
);
const normalizedNavigationCss = navigationCss.replaceAll(/\s+/g, " ");

describe("guest navigation styles", () => {
  it("keeps the header sticky, opaque, and aligned to the hero frame", () => {
    expect(navigationCss).toContain("position: sticky;");
    expect(navigationCss).toContain("top: 0;");
    expect(navigationCss).toContain("background: var(--color-paper);");
    expect(navigationCss).toContain("var(--content-width-hero)");
  });

  it("provides 48px targets and bounds the overlay panel to the viewport", () => {
    expect(navigationCss).toContain("min-height: 3rem;");
    expect(navigationCss).toContain("min-width: 3rem;");
    expect(navigationCss).toContain("max-height: calc(100dvh - 100%);");
    expect(navigationCss).toContain("overflow-y: auto;");
  });

  it("does not underline navigation links", () => {
    expect(navigationCss).toContain("text-decoration: none;");
    expect(navigationCss).not.toContain("text-decoration-line: underline;");
  });

  it("uses the approved brand and RSVP treatments", () => {
    expect(navigationCss).toContain("font-family: var(--font-script);");
    expect(navigationCss).toContain("font-size: 1rem;");
    expect(navigationCss).toContain("font-size: 1.25rem;");
    expect(navigationCss).toContain("font-weight: 700;");
    expect(navigationCss).toContain("margin-inline: 0.3125em -0.1875em;");
    expect(navigationCss).toContain("margin-inline: 0.35em -0.15em;");
    expect(navigationCss).toContain("color: var(--color-coral-action);");
    expect(navigationCss).toContain("padding: var(--space-8) var(--space-32);");
    expect(navigationCss).toContain("border-radius: var(--radius-control);");
    expect(navigationCss).toContain("letter-spacing: 0.12em;");
  });

  it("anchors a matching texture layer to the sticky header surfaces", () => {
    expect(normalizedNavigationCss).toContain(
      ".site-header__bar::after, .site-header__panel::after { position: absolute;"
    );
    expect(navigationCss).toContain(
      "background-image: var(--texture-cardboard-image);"
    );
    expect(navigationCss).toContain(
      "background-size: var(--texture-cardboard-tile-size);"
    );
    expect(navigationCss).toContain("pointer-events: none;");
  });
});
