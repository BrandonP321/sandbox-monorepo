import { describe, expect, it, vi } from "vitest";

import { AppError, createPostRoute, createRoute, createRouter, responses } from "./index";

describe("createRouter", () => {
  it("returns route response when route exists", async () => {
    const route = createRouter([
      createPostRoute("get-hello", () => responses.ok({ message: "ok" }))
    ]);

    const result = await route({ method: "POST", path: "/get-hello" });

    expect(result.statusCode).toBe(200);
    expect(result.body).toContain("ok");
  });

  it("formats AppError using standard error payload", async () => {
    const route = createRouter([
      createPostRoute("get-hello", () => {
        throw new AppError("VALIDATION_ERROR", "Bad", 422);
      })
    ]);

    const result = await route({ method: "POST", path: "/get-hello" });

    expect(result.statusCode).toBe(422);
    expect(result.body).toContain("VALIDATION_ERROR");
  });

  it("logs incoming requests", async () => {
    const logger = vi.fn();
    const route = createRouter(
      [createPostRoute("get-hello", () => responses.ok({ message: "ok" }))],
      logger
    );

    await route({ method: "POST", path: "/get-hello", requestId: "abc" });

    expect(logger).toHaveBeenCalled();
  });

  it("maps route path from filename", () => {
    const route = createPostRoute("get-health.ts", () => responses.ok({ ok: true }));

    expect(route.path).toBe("/get-health");
    expect(route.method).toBe("POST");
  });

  it("creates a route from a shared route spec", () => {
    const route = createRoute(
      { method: "POST", path: "/get-health" },
      () => responses.ok({ ok: true })
    );

    expect(route.path).toBe("/get-health");
    expect(route.method).toBe("POST");
  });
});
