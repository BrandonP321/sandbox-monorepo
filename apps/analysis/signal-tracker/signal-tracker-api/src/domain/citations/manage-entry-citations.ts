import { randomUUID } from "node:crypto";

import {
  entryCitationSchema,
  type AttachEntryCitationRequest,
  type EntryCitation,
  type EntryCitationRecord
} from "@repo/signal-tracker-shared";

import type { EntryRepository } from "../entries/entry-repository";
import type { EvidenceAnchorRepository } from "../evidence/evidence-anchor-repository";
import type { EvidenceRepository } from "../evidence/evidence-repository";
import type { EntryCitationRepository } from "./entry-citation-repository";

type CitationDependencies = {
  entryCitationRepository: EntryCitationRepository;
  entryRepository: Pick<EntryRepository, "findById">;
  evidenceRepository: Pick<EvidenceRepository, "findById">;
  evidenceAnchorRepository: Pick<EvidenceAnchorRepository, "findById">;
  generateId?: () => string;
  now?: () => Date;
};

export class EntryMissingForCitationError extends Error {
  constructor(readonly entryId: string) {
    super(`Entry not found: ${entryId}`);
  }
}

export class EvidenceItemMissingForCitationError extends Error {
  constructor(readonly evidenceItemId: string) {
    super(`Evidence item not found: ${evidenceItemId}`);
  }
}

export class EvidenceAnchorMissingForCitationError extends Error {
  constructor(readonly evidenceAnchorId: string) {
    super(`Evidence anchor not found: ${evidenceAnchorId}`);
  }
}

export class EntryCitationMissingError extends Error {
  constructor(
    readonly entryId: string,
    readonly citationId: string
  ) {
    super(`Entry citation not found: ${entryId}/${citationId}`);
  }
}

export async function attachEntryCitation(
  input: AttachEntryCitationRequest,
  dependencies: CitationDependencies
): Promise<EntryCitationRecord> {
  await assertEntryExists(input.entryId, dependencies);
  await assertEvidenceExists(input.evidenceItemId, dependencies);
  await assertAnchorMatchesEvidence(input, dependencies);

  const timestamp = (dependencies.now ?? (() => new Date()))().toISOString();
  const generateId = dependencies.generateId ?? randomUUID;
  const citation = entryCitationSchema.parse({
    id: generateId(),
    entryId: input.entryId,
    evidenceItemId: input.evidenceItemId,
    evidenceAnchorId: input.evidenceAnchorId,
    relationType: input.relationType,
    note: input.note,
    createdAt: timestamp
  });
  const storedCitation =
    await dependencies.entryCitationRepository.createOrFind(citation);

  return await buildEntryCitationRecord(storedCitation, dependencies);
}

export async function detachEntryCitation(
  entryId: string,
  citationId: string,
  dependencies: CitationDependencies
): Promise<EntryCitationRecord> {
  await assertEntryExists(entryId, dependencies);

  const citation = await dependencies.entryCitationRepository.deleteForEntry(
    entryId,
    citationId
  );

  if (!citation) {
    throw new EntryCitationMissingError(entryId, citationId);
  }

  return await buildEntryCitationRecord(citation, dependencies);
}

export async function listEntryCitations(
  entryId: string,
  dependencies: CitationDependencies
): Promise<EntryCitationRecord[]> {
  await assertEntryExists(entryId, dependencies);

  const citations =
    await dependencies.entryCitationRepository.listByEntry(entryId);

  return await Promise.all(
    citations.map((citation) =>
      buildEntryCitationRecord(citation, dependencies)
    )
  );
}

async function assertEntryExists(
  entryId: string,
  dependencies: CitationDependencies
): Promise<void> {
  const entry = await dependencies.entryRepository.findById(entryId);

  if (!entry) {
    throw new EntryMissingForCitationError(entryId);
  }
}

async function assertEvidenceExists(
  evidenceItemId: string,
  dependencies: CitationDependencies
): Promise<void> {
  const evidence =
    await dependencies.evidenceRepository.findById(evidenceItemId);

  if (!evidence) {
    throw new EvidenceItemMissingForCitationError(evidenceItemId);
  }
}

async function assertAnchorMatchesEvidence(
  input: AttachEntryCitationRequest,
  dependencies: CitationDependencies
): Promise<void> {
  if (!input.evidenceAnchorId) {
    return;
  }

  const anchor = await dependencies.evidenceAnchorRepository.findById(
    input.evidenceAnchorId
  );

  if (!anchor || anchor.evidenceItemId !== input.evidenceItemId) {
    throw new EvidenceAnchorMissingForCitationError(input.evidenceAnchorId);
  }
}

async function buildEntryCitationRecord(
  citation: EntryCitation,
  dependencies: CitationDependencies
): Promise<EntryCitationRecord> {
  const evidence = await dependencies.evidenceRepository.findById(
    citation.evidenceItemId
  );

  if (!evidence) {
    throw new EvidenceItemMissingForCitationError(citation.evidenceItemId);
  }

  if (!citation.evidenceAnchorId) {
    return { citation, evidence, anchor: null };
  }

  const anchor = await dependencies.evidenceAnchorRepository.findById(
    citation.evidenceAnchorId
  );

  if (!anchor || anchor.evidenceItemId !== citation.evidenceItemId) {
    throw new EvidenceAnchorMissingForCitationError(citation.evidenceAnchorId);
  }

  return { citation, evidence, anchor };
}
