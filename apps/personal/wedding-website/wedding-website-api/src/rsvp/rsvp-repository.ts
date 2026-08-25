import type {
  CreateRsvpSubmissionRequest,
  CreateRsvpSubmissionResponse
} from "@repo/wedding-website-shared";

export type RsvpSubmissionRecord = CreateRsvpSubmissionResponse &
  CreateRsvpSubmissionRequest;

export type StoreRsvpSubmissionInput = {
  idempotencyKeyHash: string;
  requestHash: string;
  submission: RsvpSubmissionRecord;
};

export type StoreRsvpSubmissionResult =
  | { kind: "created"; result: CreateRsvpSubmissionResponse }
  | { kind: "replayed"; result: CreateRsvpSubmissionResponse }
  | { kind: "conflict" };

export interface RsvpSubmissionRepository {
  createOrReplay(
    input: StoreRsvpSubmissionInput
  ): Promise<StoreRsvpSubmissionResult>;
}

export class RsvpPersistenceUnavailableError extends Error {
  constructor() {
    super("RSVP persistence is unavailable.");
  }
}

type IdempotencyRecord = {
  requestHash: string;
  result: CreateRsvpSubmissionResponse;
};

export class InMemoryRsvpSubmissionRepository implements RsvpSubmissionRepository {
  readonly #submissions = new Map<string, RsvpSubmissionRecord>();
  readonly #idempotencyRecords = new Map<string, IdempotencyRecord>();

  async createOrReplay(
    input: StoreRsvpSubmissionInput
  ): Promise<StoreRsvpSubmissionResult> {
    const existing = this.#idempotencyRecords.get(input.idempotencyKeyHash);

    if (existing) {
      return existing.requestHash === input.requestHash
        ? { kind: "replayed", result: structuredClone(existing.result) }
        : { kind: "conflict" };
    }

    if (this.#submissions.has(input.submission.submissionId)) {
      throw new Error("Generated submission ID already exists.");
    }

    const submission = structuredClone(input.submission);
    const result = toSubmissionResult(submission);

    this.#submissions.set(submission.submissionId, submission);
    this.#idempotencyRecords.set(input.idempotencyKeyHash, {
      requestHash: input.requestHash,
      result
    });

    return { kind: "created", result: structuredClone(result) };
  }

  getSubmissions(): RsvpSubmissionRecord[] {
    return structuredClone([...this.#submissions.values()]);
  }
}

function toSubmissionResult(
  submission: RsvpSubmissionRecord
): CreateRsvpSubmissionResponse {
  return {
    submissionId: submission.submissionId,
    submittedAt: submission.submittedAt,
    schemaVersion: submission.schemaVersion
  };
}
