import { describe, expect, it } from "vitest";

import {
  createRsvpSubmissionResponseSchema,
  weddingWebsiteApiErrorCodes,
  weddingWebsiteRouteContracts,
  weddingWebsiteRoutes
} from "./index.js";

describe("wedding website public contracts", () => {
  it("exports only the create RSVP route", () => {
    expect(weddingWebsiteRoutes).toEqual({
      createRsvpSubmission: { method: "POST", path: "/rsvp" }
    });
    expect(weddingWebsiteRouteContracts.createRsvpSubmission.route).toBe(
      weddingWebsiteRoutes.createRsvpSubmission
    );
  });

  it("exports stable application error codes", () => {
    expect(Object.values(weddingWebsiteApiErrorCodes)).toEqual([
      "VALIDATION_ERROR",
      "IDEMPOTENCY_CONFLICT",
      "PAYLOAD_TOO_LARGE",
      "THROTTLED",
      "INTERNAL_ERROR",
      "PERSISTENCE_UNAVAILABLE"
    ]);
  });

  it("enforces the exact success response contract", () => {
    expect(
      createRsvpSubmissionResponseSchema.parse({
        submissionId: "3bb32b27-c576-4c70-8078-1285efcc908c",
        submittedAt: "2026-08-25T18:42:31.412Z",
        schemaVersion: 1
      })
    ).toEqual({
      submissionId: "3bb32b27-c576-4c70-8078-1285efcc908c",
      submittedAt: "2026-08-25T18:42:31.412Z",
      schemaVersion: 1
    });
    expect(
      createRsvpSubmissionResponseSchema.safeParse({
        submissionId: "3bb32b27-c576-4c70-8078-1285efcc908c",
        submittedAt: "2026-08-25T18:42:31.412Z",
        schemaVersion: 1,
        email: "guest@example.test"
      }).success
    ).toBe(false);
  });
});
