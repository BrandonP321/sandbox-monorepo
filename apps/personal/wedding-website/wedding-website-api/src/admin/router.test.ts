import { describe, expect, it, vi } from "vitest";

import type { ApiRequest } from "@repo/api-core";

import {
  AdminRsvpReadUnavailableError,
  type AdminRsvpRepository
} from "./admin-rsvp-repository.js";
import { createAdminRsvpApiDependencies, sha256Hex } from "./dependencies.js";
import { createAdminRsvpAppRouter } from "./router.js";

const accessKey = "synthetic-admin-key-with-more-than-32-bytes";
const privateMarkers = [
  accessKey,
  sha256Hex(accessKey),
  "Synthetic Private Guest",
  "private-admin@example.test",
  "PRIVATE_ADMIN_NOTE"
];

function request(authorization?: string): ApiRequest {
  return {
    method: "GET",
    path: "/admin/rsvps",
    headers: authorization === undefined ? {} : { authorization },
    requestId: "admin-request-1"
  };
}

function createHarness(accessKeySha256 = sha256Hex(accessKey)) {
  const logger = vi.fn();
  const repository: AdminRsvpRepository = {
    listSubmissions: vi.fn().mockResolvedValue([
      {
        submissionId: "3bb32b27-c576-4c70-8078-1285efcc908c",
        submittedAt: "2026-08-26T01:35:31.000Z",
        schemaVersion: 1,
        guestSide: "brandon",
        adults: [
          {
            name: "Synthetic Private Guest",
            attendance: "not-sure",
            contact: { email: "private-admin@example.test" }
          }
        ],
        childrenAttending: 1,
        contact: { phone: "+1 202 555 0184" },
        generalNote: "PRIVATE_ADMIN_NOTE"
      }
    ])
  };
  const router = createAdminRsvpAppRouter(
    createAdminRsvpApiDependencies({
      accessKeySha256,
      logger,
      repository
    })
  );

  return { logger, repository, router };
}

describe("GET /admin/rsvps", () => {
  it.each([
    ["missing", undefined],
    ["incorrect", "Bearer incorrect-admin-key"],
    ["wrong scheme", `Basic ${accessKey}`]
  ])(
    "returns 401 for %s authorization without reading RSVPs",
    async (_label, authorization) => {
      const { repository, router } = createHarness();

      const response = await router(request(authorization));

      expect(response.statusCode).toBe(401);
      expect(JSON.parse(response.body)).toEqual({
        error: {
          code: "ADMIN_UNAUTHORIZED",
          message: "Admin access is unauthorized."
        }
      });
      expect(repository.listSubmissions).not.toHaveBeenCalled();
    }
  );

  it("uses the configured SHA-256 hash and returns a no-store validated list", async () => {
    const { router } = createHarness();

    const response = await router(request(`Bearer ${accessKey}`));

    expect(response.statusCode).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(JSON.parse(response.body)).toMatchObject({
      submissions: [
        {
          guestSide: "brandon",
          childrenAttending: 1,
          generalNote: "PRIVATE_ADMIN_NOTE"
        }
      ]
    });
  });

  it("fails closed when configuration contains plaintext instead of a SHA-256 hash", async () => {
    const { repository, router } = createHarness(accessKey);

    const response = await router(request(`Bearer ${accessKey}`));

    expect(response.statusCode).toBe(503);
    expect(repository.listSubmissions).not.toHaveBeenCalled();
  });

  it("does not log the token, configured hash, or RSVP PII", async () => {
    const { logger, router } = createHarness();

    await router(request(`Bearer ${accessKey}`));

    const logs = JSON.stringify(logger.mock.calls);
    for (const marker of privateMarkers) {
      expect(logs).not.toContain(marker);
    }
    expect(logs).toContain("admin_rsvps_listed");
    expect(logs).toContain("submissionCount");
  });

  it("maps read failures to a generic 503 without exposing error details", async () => {
    const { logger, repository, router } = createHarness();
    vi.mocked(repository.listSubmissions).mockRejectedValue(
      new AdminRsvpReadUnavailableError()
    );

    const response = await router(request(`Bearer ${accessKey}`));

    expect(response.statusCode).toBe(503);
    expect(JSON.parse(response.body)).toEqual({
      error: {
        code: "ADMIN_READ_UNAVAILABLE",
        message: "RSVP admin is temporarily unavailable."
      }
    });
    expect(JSON.stringify(logger.mock.calls)).not.toContain(accessKey);
  });
});
