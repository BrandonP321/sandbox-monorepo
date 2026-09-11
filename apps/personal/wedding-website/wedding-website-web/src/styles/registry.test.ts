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

  it("keeps mobile section headings subordinate to the page heading", () => {
    expect(normalizedRegistryCss).toContain(
      ".registry-page__intro h1 { font-size: clamp(2.1rem, 17vw, 2.25rem); }"
    );
    expect(normalizedRegistryCss).toContain(
      ".registry-page__section h2 { font-size: clamp(1.75rem, 8vw, 2rem); }"
    );
  });
});
