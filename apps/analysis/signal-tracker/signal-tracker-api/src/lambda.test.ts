import { describe, expect, it } from "vitest";

import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { signalTrackerRoutes } from "@repo/signal-tracker-shared";

import { handler } from "./lambda";

describe("lambda handler", () => {
  it("returns the health payload", async () => {
    const event = {
      rawPath: signalTrackerRoutes.getHealth.path,
      requestContext: {
        http: {
          method: signalTrackerRoutes.getHealth.method,
          path: signalTrackerRoutes.getHealth.path
        }
      }
    } as APIGatewayProxyEventV2;

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify({ ok: true }));
  });

  it("returns the standard validation error payload for invalid topic requests", async () => {
    const event = {
      rawPath: signalTrackerRoutes.createTopic.path,
      body: JSON.stringify({
        framingQuestion: "What is being tracked?"
      }),
      requestContext: {
        http: {
          method: signalTrackerRoutes.createTopic.method,
          path: signalTrackerRoutes.createTopic.path
        }
      }
    } as APIGatewayProxyEventV2;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(result.body).toContain("VALIDATION_ERROR");
  });

  it("routes get-topic requests through the standard app router", async () => {
    const event = {
      rawPath: signalTrackerRoutes.getTopic.path,
      body: JSON.stringify({}),
      requestContext: {
        http: {
          method: signalTrackerRoutes.getTopic.method,
          path: signalTrackerRoutes.getTopic.path
        }
      }
    } as APIGatewayProxyEventV2;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(result.body).toContain("VALIDATION_ERROR");
  });

  it("routes list-topics requests through the standard app router", async () => {
    const event = {
      rawPath: signalTrackerRoutes.listTopics.path,
      body: JSON.stringify({ query: 42 }),
      requestContext: {
        http: {
          method: signalTrackerRoutes.listTopics.method,
          path: signalTrackerRoutes.listTopics.path
        }
      }
    } as APIGatewayProxyEventV2;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(result.body).toContain("VALIDATION_ERROR");
  });

  it("returns the standard not found error payload", async () => {
    const event = {
      rawPath: "/get-missing",
      requestContext: { http: { method: "POST", path: "/get-missing" } }
    } as APIGatewayProxyEventV2;

    const result = await handler(event);

    expect(result.statusCode).toBe(404);
    expect(result.body).toContain("NOT_FOUND");
  });
});
