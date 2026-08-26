import {
  createRsvpSubmissionResponseSchema,
  serializeCanonicalRsvpRequest,
  weddingWebsiteApiErrorCodes,
  weddingWebsiteRoutes,
  type CreateRsvpSubmissionRequest,
  type CreateRsvpSubmissionResponse,
  type WeddingWebsiteApiErrorCode
} from "@repo/wedding-website-shared";

const RSVP_SUBMISSION_TIMEOUT_MS = 10_000;
const knownErrorCodes = new Set<string>(
  Object.values(weddingWebsiteApiErrorCodes)
);

type RsvpApiFailureKind =
  | "conflict"
  | "malformed-success"
  | "network"
  | "request"
  | "retryable"
  | "throttled"
  | "timeout"
  | "unexpected";

type RsvpApiResult =
  | { ok: true; response: CreateRsvpSubmissionResponse; status: 200 | 201 }
  | {
      ok: false;
      errorCode?: WeddingWebsiteApiErrorCode;
      kind: RsvpApiFailureKind;
      status?: number;
    };

type SubmitRsvpOptions = {
  apiBaseUrl: string;
  fetcher?: typeof fetch;
  idempotencyKey: string;
  request: CreateRsvpSubmissionRequest;
  timeoutMs?: number;
};

function createRsvpUrl(apiBaseUrl: string): string {
  return `${apiBaseUrl.replace(/\/$/, "")}${weddingWebsiteRoutes.createRsvpSubmission.path}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readKnownErrorCode(
  response: Response
): Promise<WeddingWebsiteApiErrorCode | undefined> {
  try {
    const payload: unknown = await response.json();
    const error = isRecord(payload) ? payload.error : undefined;
    const code = isRecord(error) ? error.code : undefined;

    return typeof code === "string" && knownErrorCodes.has(code)
      ? (code as WeddingWebsiteApiErrorCode)
      : undefined;
  } catch {
    return undefined;
  }
}

function classifyFailure(status: number): RsvpApiFailureKind {
  if (status === 409) {
    return "conflict";
  }
  if (status === 429) {
    return "throttled";
  }
  if (status === 400 || status === 413) {
    return "request";
  }
  if (status >= 500) {
    return "retryable";
  }
  return "unexpected";
}

async function submitRsvp({
  apiBaseUrl,
  fetcher = fetch,
  idempotencyKey,
  request,
  timeoutMs = RSVP_SUBMISSION_TIMEOUT_MS
}: SubmitRsvpOptions): Promise<RsvpApiResult> {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  let response: Response;
  try {
    response = await fetcher(createRsvpUrl(apiBaseUrl), {
      method: weddingWebsiteRoutes.createRsvpSubmission.method,
      headers: {
        "content-type": "application/json",
        "idempotency-key": idempotencyKey
      },
      body: serializeCanonicalRsvpRequest(request),
      signal: controller.signal
    });
  } catch {
    return { ok: false, kind: timedOut ? "timeout" : "network" };
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 200 || response.status === 201) {
    try {
      const parsed = createRsvpSubmissionResponseSchema.safeParse(
        await response.json()
      );
      if (parsed.success) {
        const status = response.status as 200 | 201;
        return {
          ok: true,
          response: parsed.data,
          status
        };
      }
    } catch {
      // A malformed success is ambiguous and must remain retryable.
    }

    return {
      ok: false,
      kind: "malformed-success",
      status: response.status
    };
  }

  const errorCode = await readKnownErrorCode(response);

  return {
    ok: false,
    ...(errorCode === undefined ? {} : { errorCode }),
    kind: classifyFailure(response.status),
    status: response.status
  };
}

export {
  RSVP_SUBMISSION_TIMEOUT_MS,
  createRsvpUrl,
  submitRsvp,
  type RsvpApiFailureKind,
  type RsvpApiResult,
  type SubmitRsvpOptions
};
