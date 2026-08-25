import {
  createRsvpSubmissionResponseSchema,
  rsvpSchemaVersion,
  serializeCanonicalRsvpRequest,
  type CreateRsvpSubmissionRequest,
  type CreateRsvpSubmissionResponse
} from "@repo/wedding-website-shared";
import type { Logger } from "@repo/api-core";

import {
  RsvpPersistenceUnavailableError,
  type RsvpSubmissionRecord,
  type RsvpSubmissionRepository
} from "./rsvp-repository.js";

export type SubmitRsvpDependencies = {
  repository: RsvpSubmissionRepository;
  createId: () => string;
  now: () => Date;
  hash: (value: string) => string;
  logger: Logger;
};

export type SubmitRsvpInput = {
  idempotencyKey: string;
  request: CreateRsvpSubmissionRequest;
  requestId?: string;
};

export type SubmitRsvpResult = {
  statusCode: 200 | 201 | 409;
  outcome: "created" | "replayed" | "conflict";
  response?: CreateRsvpSubmissionResponse;
};

export async function submitRsvp(
  input: SubmitRsvpInput,
  dependencies: SubmitRsvpDependencies
): Promise<SubmitRsvpResult> {
  const requestHash = dependencies.hash(
    serializeCanonicalRsvpRequest(input.request)
  );
  const idempotencyKeyHash = dependencies.hash(input.idempotencyKey);
  const result = createRsvpSubmissionResponseSchema.parse({
    submissionId: dependencies.createId(),
    submittedAt: dependencies.now().toISOString(),
    schemaVersion: rsvpSchemaVersion
  });
  const submission: RsvpSubmissionRecord = { ...input.request, ...result };

  let repositoryResult;
  try {
    repositoryResult = await dependencies.repository.createOrReplay({
      idempotencyKeyHash,
      requestHash,
      submission
    });
  } catch {
    throw new RsvpPersistenceUnavailableError();
  }

  if (repositoryResult.kind === "conflict") {
    return { statusCode: 409, outcome: "conflict" };
  }

  const statusCode = repositoryResult.kind === "created" ? 201 : 200;
  dependencies.logger({
    level: "info",
    event:
      repositoryResult.kind === "created"
        ? "rsvp_submission_created"
        : "rsvp_submission_replayed",
    requestId: input.requestId,
    route: "POST /rsvp",
    status: statusCode,
    submissionId: repositoryResult.result.submissionId
  });

  return {
    statusCode,
    outcome: repositoryResult.kind,
    response: repositoryResult.result
  };
}
