import { describe, expect, it } from "vitest";

import { HttpLambdaApi, SpaSite } from "./index";

describe("infra-patterns exports", () => {
  it("exports reusable patterns", () => {
    expect(HttpLambdaApi).toBeTypeOf("function");
    expect(SpaSite).toBeTypeOf("function");
  });
});
