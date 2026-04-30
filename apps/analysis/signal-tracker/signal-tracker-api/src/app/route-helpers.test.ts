import { describe, expect, it } from "vitest";

import { AppError } from "@repo/api-core";

import {
  createJsonRouteHandler,
  okResponse,
  parseJsonBody,
  parseRequestBody,
  withPersistenceErrorMapping
} from "./route-helpers";

describe("route helpers", () => {
  it("parses empty request bodies as an empty object", () => {
    expect(parseJsonBody(null)).toEqual({});
    expect(parseJsonBody(undefined)).toEqual({});
    expect(parseJsonBody("")).toEqual({});
  });

  it("throws a validation error for invalid JSON", () => {
    expect(() => parseJsonBody("{")).toThrow(
      expect.objectContaining({
        code: "VALIDATION_ERROR",
        statusCode: 400,
        message: "Request body must be valid JSON"
      })
    );
  });

  it("returns schema data for a valid request body", () => {
    const request = parseRequestBody(requiredNameSchema, '{"name":"Risk"}');

    expect(request).toEqual({ name: "Risk" });
  });

  it("throws a validation error with the schema message for an invalid request body", () => {
    expect(() => parseRequestBody(requiredNameSchema, "{}")).toThrow(
      expect.objectContaining({
        code: "VALIDATION_ERROR",
        statusCode: 400,
        message: "name: Name is required"
      })
    );
  });

  it("supports an explicit validation error message override", () => {
    expect(() =>
      parseRequestBody(requiredNameSchema, "{}", {
        invalidMessage: "Request is invalid"
      })
    ).toThrow(
      expect.objectContaining({
        code: "VALIDATION_ERROR",
        statusCode: 400,
        message: "Request is invalid"
      })
    );
  });

  it("falls back to a default validation message when the schema has no error details", () => {
    const schema = {
      safeParse() {
        return { success: false as const };
      }
    };

    expect(() => parseRequestBody(schema, "{}")).toThrow(
      expect.objectContaining({
        code: "VALIDATION_ERROR",
        statusCode: 400,
        message: "Request body is invalid"
      })
    );
  });

  it("validates and returns a success response", () => {
    const response = okResponse(requiredNameResponseSchema, { name: "Risk" });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ name: "Risk" });
  });

  it("creates JSON route handlers from request and response schemas", async () => {
    const handler = createJsonRouteHandler({
      contract: {
        requestSchema: requiredNameSchema,
        responseSchema: requiredNameResponseSchema
      },
      handle: (request) => ({ name: request.name.toUpperCase() })
    });

    const response = await handler({
      method: "POST",
      path: "/test",
      body: JSON.stringify({ name: "Risk" })
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ name: "RISK" });
  });

  it("maps unknown persistence failures", async () => {
    await expect(
      withPersistenceErrorMapping(() => {
        throw new Error("database unavailable");
      })
    ).rejects.toMatchObject({
      code: "PERSISTENCE_UNAVAILABLE",
      statusCode: 503
    });
  });

  it("preserves AppError failures", async () => {
    await expect(
      withPersistenceErrorMapping(() => {
        throw new AppError("TOPIC_NOT_FOUND", "Topic not found", 404);
      })
    ).rejects.toMatchObject({
      code: "TOPIC_NOT_FOUND",
      statusCode: 404
    });
  });

  it("supports explicit domain error mapping", async () => {
    class TopicMissingError extends Error {}

    await expect(
      withPersistenceErrorMapping(
        () => {
          throw new TopicMissingError("missing topic");
        },
        {
          mapDomainError: (error) =>
            error instanceof TopicMissingError
              ? new AppError("TOPIC_NOT_FOUND", "Topic not found", 404)
              : undefined
        }
      )
    ).rejects.toMatchObject({
      code: "TOPIC_NOT_FOUND",
      statusCode: 404
    });
  });
});

const requiredNameSchema = {
  safeParse(payload: unknown) {
    if (
      typeof payload === "object" &&
      payload !== null &&
      "name" in payload &&
      typeof payload.name === "string"
    ) {
      return {
        success: true as const,
        data: { name: payload.name }
      };
    }

    return {
      success: false as const,
      error: {
        issues: [{ path: ["name"], message: "Name is required" }]
      }
    };
  }
};

const requiredNameResponseSchema = {
  parse(payload: unknown) {
    const result = requiredNameSchema.safeParse(payload);

    if (!result.success) {
      throw new Error("Invalid response");
    }

    return result.data;
  }
};
