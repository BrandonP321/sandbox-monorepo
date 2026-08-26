import { describe, expect, it } from "vitest";

import prototypeCss from "./prototype.css?raw";

const normalizedPrototypeCss = prototypeCss.replaceAll(/\s+/g, " ");

describe("RSVP prototype layout", () => {
  it("top-aligns side-by-side contact fields when one displays an error", () => {
    expect(normalizedPrototypeCss).toContain(
      ".contact-input-grid { display: grid; align-items: start;"
    );
  });

  it("stacks the full-width primary action above right-aligned secondary actions on narrow screens", () => {
    expect(normalizedPrototypeCss).toContain(
      ".rsvp-step__actions { grid-template-columns: minmax(0, 1fr); gap: var(--space-8); }"
    );
    expect(normalizedPrototypeCss).toContain(
      ".rsvp-step__secondary-actions { grid-column: 1; grid-row: 2; justify-content: flex-end; gap: var(--space-8); }"
    );
    expect(normalizedPrototypeCss).toContain(
      '.rsvp-step__primary-action > .ui-button[data-variant="primary"] { width: 100%; }'
    );
  });

  it("makes the stacked attending count full width before the narrowest breakpoint", () => {
    expect(normalizedPrototypeCss).toContain(
      "@media (max-width: 47.49rem) { .review-section__heading { display: grid; grid-template-columns: minmax(0, 1fr); justify-content: stretch; }"
    );
    expect(normalizedPrototypeCss).toContain(
      ".review-attending-count { width: 100%; min-width: 0; grid-template-columns: auto minmax(0, 1fr);"
    );
  });

  it("centers a bounded ribbon action on Confirmation", () => {
    expect(normalizedPrototypeCss).toContain(
      ".confirmation-step__actions { display: flex; width: 100%; justify-content: center;"
    );
    expect(normalizedPrototypeCss).toContain(
      ".confirmation-step .confirmation-step__home { width: min(100%, 14rem); }"
    );
  });

  it("keeps the decorative Review date compact", () => {
    expect(normalizedPrototypeCss).toMatch(
      /\.rsvp-step__date \{[^}]*font-family: var\(--font-script\);[^}]*font-size: clamp\(0\.95rem, 3vw, 1\.1rem\);[^}]*letter-spacing: 0\.01em;[^}]*line-height: 1;[^}]*word-spacing: 0\.12em;[^}]*white-space: nowrap;/
    );
  });
});
