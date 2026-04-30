import { describe, expect, it } from "vitest";

import { AppError } from "@repo/api-core";

import {
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
    const request = parseRequestBody(requiredNameSchema, '{"name":"Risk"}', {
      invalidMessage: "Request is invalid"
    });

    expect(request).toEqual({ name: "Risk" });
  });

  it("throws a validation error for an invalid request body", () => {
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

  it("validates and returns a success response", () => {
    const response = okResponse(requiredNameResponseSchema, { name: "Risk" });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ name: "Risk" });
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

    return { success: false as const };
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
