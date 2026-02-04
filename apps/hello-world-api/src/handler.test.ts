import { describe, expect, it } from "vitest";

import type { APIGatewayProxyEventV2 } from "aws-lambda";

import { handler } from "./handler";

describe("handler", () => {
  it("returns hello world payload", async () => {
    const event = {
      rawPath: "/hello",
      requestContext: {
        http: {
          method: "GET",
          path: "/hello"
        }
      }
    } as APIGatewayProxyEventV2;

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify({ message: "Hello World (backend)" }));
  });
});
