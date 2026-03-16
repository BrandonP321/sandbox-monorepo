import { describe, expect, it } from "vitest";

import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { helloWorldRoutes } from "@repo/hello-world-shared";

import { handler } from "./lambda";

describe("lambda handler", () => {
  it("returns hello world payload", async () => {
    const event = {
      rawPath: helloWorldRoutes.getHello.path,
      requestContext: {
        http: {
          method: helloWorldRoutes.getHello.method,
          path: helloWorldRoutes.getHello.path
        }
      }
    } as APIGatewayProxyEventV2;

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify({ message: "Hello World (backend)" }));
  });

  it("returns standard not found error payload", async () => {
    const event = {
      rawPath: "/get-missing",
      requestContext: { http: { method: "POST", path: "/get-missing" } }
    } as APIGatewayProxyEventV2;

    const result = await handler(event);

    expect(result.statusCode).toBe(404);
    expect(result.body).toContain("NOT_FOUND");
  });
});
