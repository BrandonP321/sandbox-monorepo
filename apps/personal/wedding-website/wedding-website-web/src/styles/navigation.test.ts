import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const navigationCss = fs.readFileSync(
  path.join(process.cwd(), "src/styles/navigation.css"),
  "utf8"
);

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

  it("uses distinct non-color current state and the approved responsive breakpoint", () => {
    expect(navigationCss).toContain('aria-current="page"');
    expect(navigationCss).toContain("text-decoration-line: underline;");
    expect(navigationCss).toContain("@media (min-width: 64rem)");
  });
});
