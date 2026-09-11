import { describe, expect, it } from "vitest";

import faqCss from "./faq.css?raw";

const normalizedFaqCss = faqCss.replaceAll(/\s+/g, " ");

describe("FAQ page styles", () => {
  it("scales the VP font correction with the section-heading font size", () => {
    expect(normalizedFaqCss).toContain(
      ".faq-page__rsvp-letterfix { margin-inline-end: -0.25em; letter-spacing: 0.25em; }"
    );
  });
});
