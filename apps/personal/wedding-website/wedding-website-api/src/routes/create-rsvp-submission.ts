import {
  createRsvpSubmissionRequestSchema,
  createRsvpSubmissionResponseSchema,
  weddingWebsiteApiErrorCodes
} from "@repo/wedding-website-shared";
import {
  AppError,
  responses,
  type ApiRequest,
  type RouteHandler
} from "@repo/api-core";

import type { WeddingWebsiteApiDependencies } from "../app/dependencies.js";
import { RsvpPersistenceUnavailableError } from "../rsvp/rsvp-repository.js";
import { submitRsvp } from "../rsvp/submit-rsvp.js";

export const maxRsvpBodyBytes = 32 * 1_024;

const canonicalUuidV4Pattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function createRsvpSubmissionHandler(
  dependencies: WeddingWebsiteApiDependencies
): RouteHandler {
  return async (apiRequest) => {
    validateContentType(apiRequest);
    const idempotencyKey = parseIdempotencyKey(apiRequest);
    const request = parseRequestBody(apiRequest.body);

    let result;
    try {
      result = await submitRsvp(
        { idempotencyKey, request, requestId: apiRequest.requestId },
        dependencies
      );
    } catch (error) {
      if (error instanceof RsvpPersistenceUnavailableError) {
        throw new AppError(
          weddingWebsiteApiErrorCodes.persistenceUnavailable,
          "Submission service is temporarily unavailable.",
          503
        );
      }

      throw error;
    }

    if (result.outcome === "conflict") {
      throw new AppError(
        weddingWebsiteApiErrorCodes.idempotencyConflict,
        "Idempotency key was already used with a different request.",
        409
      );
    }

    return responses.json(
      result.statusCode,
      createRsvpSubmissionResponseSchema.parse(result.response)
    );
  };
}

function validateContentType(request: ApiRequest) {
  const contentType = getHeader(request, "content-type")
    ?.split(";", 1)[0]
    .trim()
    .toLowerCase();

  if (contentType !== "application/json") {
    throw validationError();
  }
}

function parseIdempotencyKey(request: ApiRequest): string {
  const value = getHeader(request, "idempotency-key");

  if (!value || !canonicalUuidV4Pattern.test(value)) {
    throw validationError();
  }

  return value;
}

function parseRequestBody(body: string | null | undefined) {
  if (body === null || body === undefined) {
    throw validationError();
  }

  if (Buffer.byteLength(body, "utf8") > maxRsvpBodyBytes) {
    throw new AppError(
      weddingWebsiteApiErrorCodes.payloadTooLarge,
      "Request body is too large.",
      413
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body) as unknown;
  } catch {
    throw validationError();
  }

  const parsed = createRsvpSubmissionRequestSchema.safeParse(payload);
  if (!parsed.success) {
    throw validationError();
  }

  return parsed.data;
}

function getHeader(request: ApiRequest, name: string): string | undefined {
  const matchingHeader = Object.entries(request.headers ?? {}).find(
    ([headerName]) => headerName.toLowerCase() === name
  );

  return matchingHeader?.[1];
}

function validationError() {
  return new AppError(
    weddingWebsiteApiErrorCodes.validationError,
    "Request body is invalid.",
    400
  );
}
