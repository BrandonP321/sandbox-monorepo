import { describe, expect, it } from "vitest";

import {
  adminRsvpSubmissionSchema,
  createRsvpSubmissionResponseSchema,
  listAdminRsvpsResponseSchema,
  weddingWebsiteApiErrorCodes,
  weddingWebsiteRouteContracts,
  weddingWebsiteRoutes
} from "./index.js";

describe("wedding website contracts", () => {
  it("exports the public create route and protected admin list route", () => {
    expect(weddingWebsiteRoutes).toEqual({
      createRsvpSubmission: { method: "POST", path: "/rsvp" },
      listAdminRsvps: { method: "GET", path: "/admin/rsvps" }
    });
    expect(weddingWebsiteRouteContracts.createRsvpSubmission.route).toBe(
      weddingWebsiteRoutes.createRsvpSubmission
    );
    expect(weddingWebsiteRouteContracts.listAdminRsvps.route).toBe(
      weddingWebsiteRoutes.listAdminRsvps
    );
  });

  it("exports stable application error codes", () => {
    expect(Object.values(weddingWebsiteApiErrorCodes)).toEqual([
      "ADMIN_READ_UNAVAILABLE",
      "ADMIN_UNAUTHORIZED",
      "VALIDATION_ERROR",
      "IDEMPOTENCY_CONFLICT",
      "PAYLOAD_TOO_LARGE",
      "THROTTLED",
      "INTERNAL_ERROR",
      "PERSISTENCE_UNAVAILABLE"
    ]);
  });

  it("validates the admin response without accepting persistence metadata", () => {
    const submission = {
      submissionId: "3bb32b27-c576-4c70-8078-1285efcc908c",
      submittedAt: "2026-08-25T18:42:31.412Z",
      schemaVersion: 1,
      guestSide: "niamh",
      adults: [
        {
          name: "Synthetic Guest",
          attendance: "attending",
          contact: { email: "synthetic@example.test" }
        }
      ],
      childrenAttending: 0,
      contact: { phone: "+1 202 555 0100" }
    };

    expect(
      listAdminRsvpsResponseSchema.parse({ submissions: [submission] })
    ).toEqual({
      submissions: [submission]
    });
    expect(
      adminRsvpSubmissionSchema.safeParse({
        ...submission,
        pk: `SUBMISSION#${submission.submissionId}`,
        itemType: "RSVP_SUBMISSION",
        requestHash: "private"
      }).success
    ).toBe(false);
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
