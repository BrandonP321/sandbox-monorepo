import { createHash } from "node:crypto";

import { createLogger, type Logger } from "@repo/api-core";

import {
  InMemoryAdminRsvpRepository,
  type AdminRsvpRepository
} from "./admin-rsvp-repository.js";

export const UNCONFIGURED_ADMIN_ACCESS_KEY_SHA256 = "0".repeat(64);

export type AdminRsvpApiDependencies = {
  accessKeySha256: string;
  logger: Logger;
  repository: AdminRsvpRepository;
};

export function createAdminRsvpApiDependencies(
  overrides: Partial<AdminRsvpApiDependencies> = {}
): AdminRsvpApiDependencies {
  return {
    accessKeySha256: UNCONFIGURED_ADMIN_ACCESS_KEY_SHA256,
    logger: createLogger(),
    repository: new InMemoryAdminRsvpRepository(),
    ...overrides
  };
}

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}
