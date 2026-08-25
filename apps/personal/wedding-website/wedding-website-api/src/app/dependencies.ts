import { createHash, randomUUID } from "node:crypto";

import { createLogger, type Logger } from "@repo/api-core";

import {
  InMemoryRsvpSubmissionRepository,
  type RsvpSubmissionRepository
} from "../rsvp/rsvp-repository.js";

export type WeddingWebsiteApiDependencies = {
  repository: RsvpSubmissionRepository;
  createId: () => string;
  now: () => Date;
  hash: (value: string) => string;
  logger: Logger;
};

export function createWeddingWebsiteApiDependencies(
  overrides: Partial<WeddingWebsiteApiDependencies> = {}
): WeddingWebsiteApiDependencies {
  return {
    repository: new InMemoryRsvpSubmissionRepository(),
    createId: randomUUID,
    now: () => new Date(),
    hash: sha256,
    logger: createLogger(),
    ...overrides
  };
}

export function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}
