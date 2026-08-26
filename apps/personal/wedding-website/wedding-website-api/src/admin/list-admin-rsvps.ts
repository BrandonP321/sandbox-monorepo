import { timingSafeEqual } from "node:crypto";

import {
  listAdminRsvpsResponseSchema,
  weddingWebsiteApiErrorCodes
} from "@repo/wedding-website-shared";
import {
  AppError,
  responses,
  type ApiRequest,
  type RouteHandler
} from "@repo/api-core";

import { AdminRsvpReadUnavailableError } from "./admin-rsvp-repository.js";
import {
  UNCONFIGURED_ADMIN_ACCESS_KEY_SHA256,
  sha256Hex,
  type AdminRsvpApiDependencies
} from "./dependencies.js";

const sha256HexPattern = /^[0-9a-f]{64}$/;

export function createListAdminRsvpsHandler(
  dependencies: AdminRsvpApiDependencies
): RouteHandler {
  return async (request) => {
    if (!isConfiguredHash(dependencies.accessKeySha256)) {
      throw adminUnavailable();
    }

    if (!isAuthorized(request, dependencies.accessKeySha256)) {
      throw new AppError(
        weddingWebsiteApiErrorCodes.adminUnauthorized,
        "Admin access is unauthorized.",
        401
      );
    }

    let submissions;
    try {
      submissions = await dependencies.repository.listSubmissions();
    } catch (error) {
      if (error instanceof AdminRsvpReadUnavailableError) {
        throw adminUnavailable();
      }
      throw error;
    }

    const payload = listAdminRsvpsResponseSchema.parse({ submissions });
    dependencies.logger({
      level: "info",
      event: "admin_rsvps_listed",
      requestId: request.requestId,
      route: "GET /admin/rsvps",
      status: 200,
      submissionCount: payload.submissions.length
    });

    const response = responses.json(200, payload);
    return {
      ...response,
      headers: { ...response.headers, "cache-control": "no-store" }
    };
  };
}

function isAuthorized(request: ApiRequest, accessKeySha256: string): boolean {
  const authorization = getHeader(request, "authorization");
  const match = authorization?.match(/^Bearer ([^\s]+)$/);
  if (!match) {
    return false;
  }

  const configuredHash = Buffer.from(accessKeySha256, "hex");
  const presentedHash = Buffer.from(sha256Hex(match[1]), "hex");
  return timingSafeEqual(configuredHash, presentedHash);
}

function isConfiguredHash(value: string): boolean {
  return (
    sha256HexPattern.test(value) &&
    value !== UNCONFIGURED_ADMIN_ACCESS_KEY_SHA256
  );
}

function getHeader(request: ApiRequest, name: string): string | undefined {
  return Object.entries(request.headers ?? {}).find(
    ([headerName]) => headerName.toLowerCase() === name
  )?.[1];
}

function adminUnavailable(): AppError {
  return new AppError(
    weddingWebsiteApiErrorCodes.adminReadUnavailable,
    "RSVP admin is temporarily unavailable.",
    503
  );
}
