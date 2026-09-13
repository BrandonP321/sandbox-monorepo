import { describe, expect, it } from "vitest";

import weddingDayCss from "./weddingDay.css?raw";

const normalizedWeddingDayCss = weddingDayCss.replaceAll(/\s+/g, " ");

describe("Wedding Day page styles", () => {
  it("uses the approved date and mobile intro spacing", () => {
    expect(normalizedWeddingDayCss).toMatch(
      /\.wedding-day-page__intro time \{[^}]*margin-block-start: var\(--space-32\);/
    );
    expect(normalizedWeddingDayCss).toMatch(
      /@media \(max-width: 47\.49rem\) \{.*\.wedding-day-page__content \{ padding-block: var\(--space-32\) var\(--space-24\); \}/
    );
    expect(normalizedWeddingDayCss).toMatch(
      /@media \(max-width: 47\.49rem\) \{.*\.wedding-day-page__peripheral-art \.wedding-corner-floral \{ top: -1rem; left: -2\.5rem; width: 9rem; \}/
    );
    expect(normalizedWeddingDayCss).toMatch(
      /@media \(max-width: 47\.49rem\) \{.*\.wedding-day-page__disco-ball \{ top: -1\.5rem; right: 0; width: min\(4rem, 18vw\); \}/
    );
    expect(normalizedWeddingDayCss).not.toMatch(
      /\.wedding-day-page__peripheral-art \.wedding-corner-floral \{[^}]*display: none;/
    );
  });

  it("pins the closing illustration to the full-width page bottom", () => {
    expect(normalizedWeddingDayCss).toMatch(
      /\.wedding-day-page \{[^}]*display: flex;[^}]*flex-direction: column;[^}]*padding-block-start: var\(--space-32\);/
    );
    expect(normalizedWeddingDayCss).toMatch(
      /\.wedding-day-page__frame \{[^}]*flex: 1 0 auto;/
    );
    expect(normalizedWeddingDayCss).toMatch(
      /\.wedding-day-page__closing-accent \{[^}]*width: 100%;[^}]*aspect-ratio: 800 \/ 469;[^}]*margin-block-start: auto;/
    );
  });
});
