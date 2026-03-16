import { describe, expect, it } from "vitest";

import { apiErrorSchema } from "./index";

describe("apiErrorSchema", () => {
  it("accepts the standard error payload shape", () => {
    const payload = apiErrorSchema.parse({
      error: { code: "NOT_FOUND", message: "Not Found" }
    });

    expect(payload.error.code).toBe("NOT_FOUND");
  });
});
