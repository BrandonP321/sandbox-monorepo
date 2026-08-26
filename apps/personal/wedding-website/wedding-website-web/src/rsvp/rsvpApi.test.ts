import { afterEach, describe, expect, it, vi } from "vitest";

import { weddingWebsiteApiErrorCodes } from "@repo/wedding-website-shared";

import { submitRsvp } from "./rsvpApi";
import { mapDraftToRsvpSubmission } from "./rsvpSubmission";
import { createInitialDraft, updateAdult } from "./rsvpDraft";

const IDEMPOTENCY_KEY = "7ad1a5a8-8e35-4d9d-99b0-21181700cb95";

function createRequest() {
  let draft = createInitialDraft();
  draft = {
    ...draft,
    guestSide: "brandon",
    contact: { email: "party@example.test", phone: "" }
  };
  draft = updateAdult(draft, "adult-1", (adult) => ({
    ...adult,
    name: "Alex Example",
    attendance: "attending",
    contact: { email: "adult@example.test", phone: "" }
  }));
  return mapDraftToRsvpSubmission(draft);
}

function createSuccessResponse(status: 200 | 201): Response {
  return new Response(
    JSON.stringify({
      submissionId: "4c338adc-ff18-4d44-8062-d425903472fb",
      submittedAt: "2026-08-26T01:35:31.468Z",
      schemaVersion: 1
    }),
    { status }
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe("submitRsvp", () => {
  it.each([200, 201] as const)(
    "accepts and validates a %s response",
    async (status) => {
      const fetcher = vi.fn(async () => createSuccessResponse(status));
      const request = createRequest();

      await expect(
        submitRsvp({
          apiBaseUrl: "https://api.example.test/",
          fetcher,
          idempotencyKey: IDEMPOTENCY_KEY,
          request
        })
      ).resolves.toMatchObject({ ok: true, status });

      expect(fetcher).toHaveBeenCalledWith(
        "https://api.example.test/rsvp",
        expect.objectContaining({
          method: "POST",
          headers: {
            "content-type": "application/json",
            "idempotency-key": IDEMPOTENCY_KEY
          },
          body: JSON.stringify(request)
        })
      );
    }
  );

  it("treats a malformed success response as ambiguous", async () => {
    const result = await submitRsvp({
      apiBaseUrl: "http://localhost:3001",
      fetcher: vi.fn(async () => new Response("{}", { status: 201 })),
      idempotencyKey: IDEMPOTENCY_KEY,
      request: createRequest()
    });

    expect(result).toEqual({
      ok: false,
      kind: "malformed-success",
      status: 201
    });
  });

  it.each([
    [400, "request"],
    [409, "conflict"],
    [413, "request"],
    [429, "throttled"],
    [500, "retryable"],
    [503, "retryable"],
    [404, "unexpected"]
  ] as const)("classifies HTTP %s as %s", async (status, kind) => {
    const result = await submitRsvp({
      apiBaseUrl: "http://localhost:3001",
      fetcher: vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              error: {
                code:
                  status === 409
                    ? weddingWebsiteApiErrorCodes.idempotencyConflict
                    : "PROVIDER_CONTROLLED",
                message: "Safe generic error"
              }
            }),
            { status }
          )
      ),
      idempotencyKey: IDEMPOTENCY_KEY,
      request: createRequest()
    });

    expect(result).toMatchObject({ ok: false, kind, status });
    if (status === 409) {
      expect(result).toMatchObject({
        errorCode: weddingWebsiteApiErrorCodes.idempotencyConflict
      });
    }
  });

  it("classifies a network failure", async () => {
    const result = await submitRsvp({
      apiBaseUrl: "http://localhost:3001",
      fetcher: vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
      idempotencyKey: IDEMPOTENCY_KEY,
      request: createRequest()
    });

    expect(result).toEqual({ ok: false, kind: "network" });
  });

  it("aborts and classifies a client timeout", async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn(
      async (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        })
    );
    const pendingResult = submitRsvp({
      apiBaseUrl: "http://localhost:3001",
      fetcher,
      idempotencyKey: IDEMPOTENCY_KEY,
      request: createRequest(),
      timeoutMs: 25
    });

    await vi.advanceTimersByTimeAsync(25);

    await expect(pendingResult).resolves.toEqual({
      ok: false,
      kind: "timeout"
    });
  });
});
