import { describe, expect, it } from "vitest";

import {
  helloWorldGetHelloResponseSchema,
  helloWorldRouteEntries,
  helloWorldRouteList,
  helloWorldRoutes
} from "./index";

describe("helloWorldRoutes", () => {
  it("defines the hello world API routes once for all consumers", () => {
    expect(helloWorldRoutes.getHello).toEqual({
      method: "POST",
      path: "/get-hello"
    });
    expect(helloWorldRoutes.getHealth).toEqual({
      method: "POST",
      path: "/get-health"
    });
  });

  it("exposes stable list and entry helpers", () => {
    expect(helloWorldRouteEntries.map(([name]) => name)).toEqual([
      "getHello",
      "getHealth"
    ]);
    expect(helloWorldRouteList).toEqual([
      helloWorldRoutes.getHello,
      helloWorldRoutes.getHealth
    ]);
  });

  it("validates the hello response payload", () => {
    const payload = helloWorldGetHelloResponseSchema.parse({ message: "hello" });

    expect(payload.message).toBe("hello");
  });
});
