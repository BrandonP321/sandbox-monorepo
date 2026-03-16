import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("joins truthy class values into a single string", () => {
    const optionalClass = null;

    expect(cn("button", optionalClass, "button--primary")).toBe(
      "button button--primary"
    );
  });
});
