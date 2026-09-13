import { describe, expect, it } from "vitest";

import weddingDayCss from "./weddingDay.css?raw";

const normalizedWeddingDayCss = weddingDayCss.replaceAll(/\s+/g, " ");

describe("Wedding Day page styles", () => {
  it("uses the approved date and mobile intro spacing", () => {
    expect(normalizedWeddingDayCss).toMatch(
      /\.wedding-day-page__intro time \{[^}]*margin-block-start: var\(--space-32\);/
    );
    expect(normalizedWeddingDayCss).toMatch(
      /@media \(max-width: 47\.49rem\) \{.*\.wedding-day-page__content \{ padding-block-start: var\(--space-32\); \}/
    );
    expect(normalizedWeddingDayCss).toMatch(
      /@media \(max-width: 47\.49rem\) \{.*\.wedding-day-page__disco-ball \{ top: -1\.5rem; right: 0; width: min\(4rem, 18vw\); \}/
    );
  });

  it("reserves the Registry heart aspect ratio for the closing accent", () => {
    expect(normalizedWeddingDayCss).toMatch(
      /\.wedding-day-page__closing-accent \{[^}]*width: 3\.25rem;[^}]*aspect-ratio: 500 \/ 337;/
    );
  });
});
