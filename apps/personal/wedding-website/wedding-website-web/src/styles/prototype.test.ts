import { describe, expect, it } from "vitest";

import prototypeCss from "./prototype.css?raw";

const normalizedPrototypeCss = prototypeCss.replaceAll(/\s+/g, " ");

describe("RSVP prototype layout", () => {
  it("top-aligns side-by-side contact fields when one displays an error", () => {
    expect(normalizedPrototypeCss).toContain(
      ".contact-input-grid { display: grid; align-items: start;"
    );
  });
});
