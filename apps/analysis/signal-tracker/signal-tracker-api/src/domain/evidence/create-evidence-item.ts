import { randomUUID } from "node:crypto";

import {
  evidenceItemSchema,
  sourceSchema,
  type CreateEvidenceItemRequest,
  type EvidenceRecord
} from "@repo/signal-tracker-shared";

import type { EvidenceRepository } from "./evidence-repository";

type CreateEvidenceItemDependencies = {
  repository: Pick<EvidenceRepository, "create">;
  generateId?: () => string;
  now?: () => Date;
};

export async function createEvidenceItemRecord(
  input: CreateEvidenceItemRequest,
  dependencies: CreateEvidenceItemDependencies
): Promise<EvidenceRecord> {
  const timestamp = (dependencies.now ?? (() => new Date()))().toISOString();
  const generateId = dependencies.generateId ?? randomUUID;
  const source = sourceSchema.parse({
    id: generateId(),
    canonicalName: input.source.canonicalName,
    baseUrl: input.source.baseUrl,
    sourceType: input.source.sourceType,
    notes: input.source.notes,
    createdAt: timestamp,
    updatedAt: timestamp
  });
  const evidenceItem = evidenceItemSchema.parse({
    id: generateId(),
    sourceId: source.id,
    canonicalUrl: input.canonicalUrl,
    title: input.title,
    author: input.author,
    publishedAt: input.publishedAt,
    capturedAt: input.capturedAt ?? timestamp,
    contentType: input.contentType,
    language: input.language,
    snapshotHash: input.snapshotHash,
    storageKey: input.storageKey,
    metadata: input.metadata ?? {},
    createdAt: timestamp,
    updatedAt: timestamp
  });

  return await dependencies.repository.create({ source, evidenceItem });
}
