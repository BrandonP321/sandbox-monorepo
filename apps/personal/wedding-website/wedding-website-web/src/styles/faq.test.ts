import { describe, expect, it } from "vitest";

import faqCss from "./faq.css?raw";
import layoutCss from "./layout.css?raw";

const normalizedFaqCss = faqCss.replaceAll(/\s+/g, " ");
const normalizedLayoutCss = layoutCss.replaceAll(/\s+/g, " ");

describe("FAQ page styles", () => {
  it("scales the VP font correction with the section-heading font size", () => {
    expect(normalizedFaqCss).toContain(
      ".faq-page__rsvp-letterfix { margin-inline-end: -0.25em; letter-spacing: 0.25em; }"
    );
  });

  it("keeps both top illustrations visible on narrow mobile screens", () => {
    expect(normalizedLayoutCss).toMatch(
      /\.wedding-corner-floral \{[^}]*top: -0\.125rem;[^}]*left: -2rem;[^}]*display: block;[^}]*width: 10rem;/
    );
    expect(normalizedFaqCss).toMatch(
      /@media \(max-width: 47\.49rem\) \{.*\.faq-page__disco-ball \{ top: -1rem; width: min\(6rem, 24vw\); \}/
    );
    expect(normalizedFaqCss).not.toContain(
      ".faq-page__peripheral-art .wedding-corner-floral, .faq-page__disco-ball { display: none; }"
    );
  });
});
