import type {
  AttachedSourceSummary,
  EntryCitation,
  EvidenceRecord
} from "@repo/signal-tracker-shared";
import { attachedSourceSummarySchema } from "@repo/signal-tracker-shared";

export type EntrySourceSummaryMap = Map<string, AttachedSourceSummary[]>;

export type EntrySourceSummaryRepository = {
  listByEntryIds(entryIds: string[]): Promise<EntrySourceSummaryMap>;
};

export class InMemoryEntrySourceSummaryRepository implements EntrySourceSummaryRepository {
  private readonly summaries = new Map<string, AttachedSourceSummary[]>();

  setSources(entryId: string, sources: AttachedSourceSummary[]): void {
    this.summaries.set(entryId, sources);
  }

  async listByEntryIds(entryIds: string[]): Promise<EntrySourceSummaryMap> {
    const requestedEntryIds = new Set(entryIds);

    return new Map(
      Array.from(requestedEntryIds, (entryId) => [
        entryId,
        this.summaries.get(entryId) ?? []
      ])
    );
  }
}

export function buildAttachedSourceSummary(
  citation: EntryCitation,
  evidence: EvidenceRecord
): AttachedSourceSummary {
  const canonicalUrl = evidence.evidenceItem.canonicalUrl;
  const url = canonicalUrl ?? evidence.source.baseUrl;
  const sourceDomain = getUrlHostname(evidence.source.baseUrl ?? canonicalUrl);

  return attachedSourceSummarySchema.parse({
    id: citation.id,
    evidenceItemId: citation.evidenceItemId,
    ...(url ? { url } : {}),
    ...(canonicalUrl ? { canonicalUrl } : {}),
    title: evidence.evidenceItem.title || canonicalUrl || "Source",
    sourceName: evidence.source.canonicalName || sourceDomain || "Source",
    ...(sourceDomain ? { sourceDomain } : {}),
    ...(evidence.evidenceItem.publishedAt
      ? { publishedAt: evidence.evidenceItem.publishedAt }
      : {}),
    relationType: citation.relationType
  });
}

function getUrlHostname(url: string | undefined): string | undefined {
  if (!url) {
    return undefined;
  }

  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}
