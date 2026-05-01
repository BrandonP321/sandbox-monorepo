import { randomUUID } from "node:crypto";

import {
  evidenceAnchorSchema,
  type CreateEvidenceAnchorRequest,
  type EvidenceAnchor
} from "@repo/signal-tracker-shared";

import type { EvidenceRepository } from "./evidence-repository";
import type { EvidenceAnchorRepository } from "./evidence-anchor-repository";

type CreateEvidenceAnchorDependencies = {
  repository: Pick<EvidenceAnchorRepository, "create">;
  evidenceRepository: Pick<EvidenceRepository, "findById">;
  generateId?: () => string;
  now?: () => Date;
};

export class EvidenceItemMissingForAnchorError extends Error {
  constructor(readonly evidenceItemId: string) {
    super(`Evidence item not found: ${evidenceItemId}`);
  }
}

export async function createEvidenceAnchorRecord(
  input: CreateEvidenceAnchorRequest,
  dependencies: CreateEvidenceAnchorDependencies
): Promise<EvidenceAnchor> {
  const evidenceRecord = await dependencies.evidenceRepository.findById(
    input.evidenceItemId
  );

  if (!evidenceRecord) {
    throw new EvidenceItemMissingForAnchorError(input.evidenceItemId);
  }

  const timestamp = (dependencies.now ?? (() => new Date()))().toISOString();
  const generateId = dependencies.generateId ?? randomUUID;
  const anchor = evidenceAnchorSchema.parse({
    id: generateId(),
    evidenceItemId: input.evidenceItemId,
    quoteText: input.quoteText,
    prefix: input.prefix,
    suffix: input.suffix,
    pageLabel: input.pageLabel,
    startPos: input.startPos,
    endPos: input.endPos,
    locator: input.locator,
    createdAt: timestamp,
    updatedAt: timestamp
  });

  return await dependencies.repository.create(anchor);
}
