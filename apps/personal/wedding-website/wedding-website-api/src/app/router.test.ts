import { describe, expect, it, vi } from "vitest";

import type { ApiRequest } from "@repo/api-core";

import { createWeddingWebsiteApiDependencies, sha256 } from "./dependencies.js";
import { createWeddingWebsiteAppRouter } from "./router.js";
import {
  InMemoryRsvpSubmissionRepository,
  type RsvpSubmissionRepository
} from "../rsvp/rsvp-repository.js";
import { maxRsvpBodyBytes } from "../routes/create-rsvp-submission.js";

const firstAttemptKey = "7ad1a5a8-8e35-4d9d-99b0-21181700cb95";
const secondAttemptKey = "4cc46f4b-1656-414d-b83d-1be9f7f12cb2";
const submissionIds = [
  "3bb32b27-c576-4c70-8078-1285efcc908c",
  "a7b606b8-e5d0-40a7-a023-f3597f1b1aa9",
  "eef87228-f78c-483b-bfc7-3ced2c2cbe1c"
];

function validPayload() {
  return {
    guestSide: "niamh",
    adults: [
      {
        name: "Example Guest",
        attendance: "attending",
        contact: { email: "guest@example.test" }
      }
    ],
    childrenAttending: 1,
    contact: { phone: "+1 202 555 0148" },
    generalNote: "Thank you"
  };
}

function apiRequest(overrides: Partial<ApiRequest> = {}): ApiRequest {
  return {
    method: "POST",
    path: "/rsvp",
    headers: {
      "content-type": "application/json",
      "idempotency-key": firstAttemptKey
    },
    body: JSON.stringify(validPayload()),
    requestId: "request-1",
    ...overrides
  };
}

function createHarness(
  repository: RsvpSubmissionRepository = new InMemoryRsvpSubmissionRepository()
) {
  const logger = vi.fn();
  let idIndex = 0;
  let timeIndex = 0;
  const dependencies = createWeddingWebsiteApiDependencies({
    repository,
    createId: () => submissionIds[idIndex++] ?? submissionIds.at(-1)!,
    now: () => new Date(Date.UTC(2026, 7, 25, 18, 42, 31 + timeIndex++)),
    hash: sha256,
    logger
  });

  return {
    logger,
    repository,
    router: createWeddingWebsiteAppRouter(dependencies)
  };
}

function responseBody(
  response: Awaited<
    ReturnType<ReturnType<typeof createWeddingWebsiteAppRouter>>
  >
) {
  return JSON.parse(response.body) as Record<string, unknown>;
}

describe("POST /rsvp", () => {
  it("returns 201 for the first attempt", async () => {
    const { router } = createHarness();

    const response = await router(apiRequest());

    expect(response.statusCode).toBe(201);
    expect(responseBody(response)).toEqual({
      submissionId: submissionIds[0],
      submittedAt: "2026-08-25T18:42:31.000Z",
      schemaVersion: 1
    });
  });

  it("returns 200 and the original result for an exact delayed replay", async () => {
    const { router } = createHarness();
    const first = await router(apiRequest());
    const replay = await router(apiRequest({ requestId: "request-later" }));

    expect(replay.statusCode).toBe(200);
    expect(responseBody(replay)).toEqual(responseBody(first));
  });

  it("treats inputs that normalize identically as an exact replay", async () => {
    const { router } = createHarness();
    const firstPayload = validPayload();
    firstPayload.adults[0].name = "  Example Guest  ";
    firstPayload.adults[0].contact.email = " GUEST@EXAMPLE.TEST ";

    const first = await router(
      apiRequest({ body: JSON.stringify(firstPayload) })
    );
    const replay = await router(apiRequest());

    expect(first.statusCode).toBe(201);
    expect(replay.statusCode).toBe(200);
    expect(responseBody(replay)).toEqual(responseBody(first));
  });

  it("returns 409 when the same key is reused for a changed request", async () => {
    const { router } = createHarness();
    await router(apiRequest());
    const changed = { ...validPayload(), childrenAttending: 2 };

    const response = await router(
      apiRequest({ body: JSON.stringify(changed) })
    );

    expect(response.statusCode).toBe(409);
    expect(responseBody(response)).toEqual({
      error: {
        code: "IDEMPOTENCY_CONFLICT",
        message: "Idempotency key was already used with a different request."
      }
    });
  });

  it("creates a new submission for identical guest data with a different key", async () => {
    const { router } = createHarness();
    const first = await router(apiRequest());
    const second = await router(
      apiRequest({
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Idempotency-Key": secondAttemptKey
        }
      })
    );

    expect(first.statusCode).toBe(201);
    expect(second.statusCode).toBe(201);
    expect(responseBody(second).submissionId).not.toBe(
      responseBody(first).submissionId
    );
  });

  it.each([
    ["missing", undefined],
    ["non-UUID", "not-a-uuid"],
    ["non-v4 UUID", "7ad1a5a8-8e35-3d9d-99b0-21181700cb95"],
    ["uppercase UUID", firstAttemptKey.toUpperCase()],
    ["whitespace-padded UUID", ` ${firstAttemptKey} `]
  ])("returns 400 for a %s idempotency key", async (_label, key) => {
    const { router } = createHarness();
    const response = await router(
      apiRequest({
        headers: {
          "content-type": "application/json",
          "idempotency-key": key
        }
      })
    );

    expect(response.statusCode).toBe(400);
    expect(responseBody(response)).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request body is invalid."
      }
    });
  });

  it.each([undefined, "text/plain"])(
    "returns 400 for JSON content type %s",
    async (contentType) => {
      const { router } = createHarness();
      const response = await router(
        apiRequest({
          headers: {
            "content-type": contentType,
            "idempotency-key": firstAttemptKey
          }
        })
      );

      expect(response.statusCode).toBe(400);
    }
  );

  it.each(["{", "null", "[]"])(
    "returns 400 for malformed or non-object JSON %s",
    async (body) => {
      const { router } = createHarness();
      const response = await router(apiRequest({ body }));

      expect(response.statusCode).toBe(400);
      expect(responseBody(response)).toEqual({
        error: {
          code: "VALIDATION_ERROR",
          message: "Request body is invalid."
        }
      });
    }
  );

  it("returns 413 before parsing a body over 32 KiB", async () => {
    const { router } = createHarness();
    const response = await router(apiRequest({ body: "é".repeat(16_385) }));

    expect(response.statusCode).toBe(413);
    expect(responseBody(response)).toEqual({
      error: {
        code: "PAYLOAD_TOO_LARGE",
        message: "Request body is too large."
      }
    });
  });

  it("accepts a valid body at exactly 32 KiB", async () => {
    const { router } = createHarness();
    const body = JSON.stringify(validPayload());
    const exactlyAtLimit = body.padEnd(maxRsvpBodyBytes, " ");

    expect(Buffer.byteLength(exactlyAtLimit, "utf8")).toBe(maxRsvpBodyBytes);
    const response = await router(apiRequest({ body: exactlyAtLimit }));

    expect(response.statusCode).toBe(201);
  });

  it("maps repository unavailability to a safe 503", async () => {
    const repository: RsvpSubmissionRepository = {
      createOrReplay: vi
        .fn()
        .mockRejectedValue(new Error("database contained guest@example.test"))
    };
    const { router, logger } = createHarness(repository);

    const response = await router(apiRequest());

    expect(response.statusCode).toBe(503);
    expect(responseBody(response)).toEqual({
      error: {
        code: "PERSISTENCE_UNAVAILABLE",
        message: "Submission service is temporarily unavailable."
      }
    });
    expect(JSON.stringify(logger.mock.calls)).not.toContain(
      "guest@example.test"
    );
  });

  it("returns a generic 500 and sanitizes unexpected errors", async () => {
    const logger = vi.fn();
    const dependencies = createWeddingWebsiteApiDependencies({
      hash: (value) => {
        throw new Error(`failed while hashing ${value}`);
      },
      logger
    });
    const router = createWeddingWebsiteAppRouter(dependencies);

    const response = await router(apiRequest());

    expect(response.statusCode).toBe(500);
    expect(responseBody(response)).toEqual({
      error: { code: "INTERNAL_ERROR", message: "Internal Server Error" }
    });
    const logs = JSON.stringify(logger.mock.calls);
    expect(logs).not.toContain("Example Guest");
    expect(logs).not.toContain("guest@example.test");
    expect(logs).not.toContain(firstAttemptKey);
    expect(logs).not.toContain("failed while hashing");
  });

  it("logs only PII-safe operational fields for successful submissions", async () => {
    const { router, logger } = createHarness();
    const response = await router(apiRequest());

    expect(response.statusCode).toBe(201);
    const logs = JSON.stringify(logger.mock.calls);
    expect(logs).toContain(submissionIds[0]);
    expect(logs).not.toContain("Example Guest");
    expect(logs).not.toContain("guest@example.test");
    expect(logs).not.toContain("Thank you");
    expect(logs).not.toContain(firstAttemptKey);
    expect(logs).not.toContain(sha256(firstAttemptKey));
  });
});
