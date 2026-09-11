import { describe, expect, it } from "vitest";

import pageHeadingsCss from "./pageHeadings.css?raw";
import registryCss from "./registry.css?raw";

const normalizedPageHeadingsCss = pageHeadingsCss.replaceAll(/\s+/g, " ");
const normalizedRegistryCss = registryCss.replaceAll(/\s+/g, " ");

describe("registry page styles", () => {
  it("keeps the corner bow inset from the top-right edges", () => {
    expect(normalizedRegistryCss).toContain(
      ".registry-page__bow { position: absolute; top: 1rem; right: 2rem; display: block; width: 10rem;"
    );
    expect(normalizedRegistryCss).toContain(
      ".registry-page__bow { top: 0.5rem; right: 0.75rem; width: min(6rem, 24vw); }"
    );
  });

  it("shares the approved informational-page display typography", () => {
    expect(normalizedPageHeadingsCss).toMatch(
      /\.guest-page-heading, \.guest-section-heading \{[^}]*font-family: var\(--font-script\);[^}]*font-weight: 400;/
    );
    expect(normalizedPageHeadingsCss).toMatch(
      /\.guest-page-heading \{[^}]*font-size: 3rem;[^}]*letter-spacing: -0\.04em;[^}]*line-height: 5rem;/
    );
    expect(normalizedPageHeadingsCss).toMatch(
      /\.guest-section-heading \{[^}]*font-size: 2rem;[^}]*line-height: 4\.5rem;/
    );
    expect(normalizedRegistryCss).toMatch(
      /\.registry-page__closing p \{[^}]*font-family: var\(--font-script\);[^}]*font-size: 1\.25rem;[^}]*line-height: 3rem;/
    );
  });

  it("uses the requested compact script typography on mobile", () => {
    expect(normalizedPageHeadingsCss).toMatch(
      /@media \(max-width: 47\.49rem\) \{.*\.guest-page-heading \{ font-size: 2rem; line-height: 3rem; \}.*\.guest-section-heading \{ font-size: 1\.25rem; line-height: 2\.5rem; \}/
    );
  });
});
