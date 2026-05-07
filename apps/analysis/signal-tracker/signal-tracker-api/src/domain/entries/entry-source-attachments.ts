import { randomUUID } from "node:crypto";

import {
  entryCitationSchema,
  type EntryCitation,
  type EntrySourceInput,
  type EvidenceRecord
} from "@repo/signal-tracker-shared";

import type { EntryCitationRepository } from "../citations/entry-citation-repository";
import {
  canonicalizeEvidenceUrl,
  captureEvidenceUrlRecord
} from "../evidence/capture-evidence-url";
import type { EvidenceRepository } from "../evidence/evidence-repository";

type EntrySourceAttachmentDependencies = {
  evidenceRepository: Pick<EvidenceRepository, "create">;
  entryCitationRepository: Pick<
    EntryCitationRepository,
    "createOrFind" | "listByEntry" | "deleteForEntry"
  >;
  generateId?: () => string;
  now?: () => Date;
};

export async function replaceEntrySourceAttachments(
  entryId: string,
  sources: EntrySourceInput[],
  dependencies: EntrySourceAttachmentDependencies
): Promise<EntryCitation[]> {
  const sourceUrls = getUniqueCanonicalSourceUrls(sources);
  const evidenceRecords: EvidenceRecord[] = [];

  for (const url of sourceUrls) {
    evidenceRecords.push(
      await captureEvidenceUrlRecord(
        { url },
        {
          repository: dependencies.evidenceRepository,
          generateId: dependencies.generateId,
          now: dependencies.now
        }
      )
    );
  }

  const desiredEvidenceItemIds = new Set(
    evidenceRecords.map((record) => record.evidenceItem.id)
  );
  const existingCitations =
    await dependencies.entryCitationRepository.listByEntry(entryId);

  for (const citation of existingCitations
    .filter(isManagedSourceCitation)
    .filter(
      (citation) => !desiredEvidenceItemIds.has(citation.evidenceItemId)
    )) {
    await dependencies.entryCitationRepository.deleteForEntry(
      entryId,
      citation.id
    );
  }

  const attachedCitations: EntryCitation[] = [];

  for (const record of evidenceRecords) {
    attachedCitations.push(
      await dependencies.entryCitationRepository.createOrFind(
        createManagedSourceCitation(
          entryId,
          record.evidenceItem.id,
          dependencies
        )
      )
    );
  }

  return attachedCitations;
}

function getUniqueCanonicalSourceUrls(sources: EntrySourceInput[]): string[] {
  return Array.from(
    new Set(sources.map((source) => canonicalizeEvidenceUrl(source.url)))
  );
}

function isManagedSourceCitation(citation: EntryCitation): boolean {
  return (
    citation.relationType === "source_for" &&
    citation.evidenceAnchorId === undefined
  );
}

function createManagedSourceCitation(
  entryId: string,
  evidenceItemId: string,
  dependencies: EntrySourceAttachmentDependencies
): EntryCitation {
  const timestamp = (dependencies.now ?? (() => new Date()))().toISOString();

  return entryCitationSchema.parse({
    id: (dependencies.generateId ?? randomUUID)(),
    entryId,
    evidenceItemId,
    relationType: "source_for",
    createdAt: timestamp
  });
}
