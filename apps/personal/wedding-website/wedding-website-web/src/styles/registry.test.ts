import { describe, expect, it } from "vitest";

import registryCss from "./registry.css?raw";

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

  it("uses the requested script typography for display copy", () => {
    expect(normalizedRegistryCss).toMatch(
      /\.registry-page__intro h1 \{[^}]*font-family: var\(--font-script\);[^}]*font-size: 3rem;[^}]*line-height: 5rem;/
    );
    expect(normalizedRegistryCss).toMatch(
      /\.registry-page__section h2 \{[^}]*font-family: var\(--font-script\);[^}]*font-size: 2rem;[^}]*line-height: 4\.5rem;/
    );
    expect(normalizedRegistryCss).toMatch(
      /\.registry-page__closing p \{[^}]*font-family: var\(--font-script\);[^}]*font-size: 1\.25rem;[^}]*line-height: 3rem;/
    );
  });
});
