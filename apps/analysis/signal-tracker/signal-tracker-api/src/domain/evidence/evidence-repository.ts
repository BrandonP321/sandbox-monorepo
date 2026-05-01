import type { EvidenceRecord } from "@repo/signal-tracker-shared";

export type EvidenceRepository = {
  create(record: EvidenceRecord): Promise<EvidenceRecord>;
  findById(id: string): Promise<EvidenceRecord | undefined>;
};

export class InMemoryEvidenceRepository implements EvidenceRepository {
  private readonly sources = new Map<string, EvidenceRecord["source"]>();
  private readonly evidenceItems = new Map<
    string,
    EvidenceRecord["evidenceItem"]
  >();

  async create(record: EvidenceRecord): Promise<EvidenceRecord> {
    const existingEvidence = this.findExistingEvidence(record);

    if (existingEvidence) {
      return existingEvidence;
    }

    const source = this.findReusableSource(record.source) ?? record.source;
    const evidenceItem = {
      ...record.evidenceItem,
      sourceId: source.id
    };

    this.sources.set(source.id, source);
    this.evidenceItems.set(evidenceItem.id, evidenceItem);

    return { source, evidenceItem };
  }

  async findById(id: string): Promise<EvidenceRecord | undefined> {
    const evidenceItem = this.evidenceItems.get(id);

    if (!evidenceItem) {
      return undefined;
    }

    const source = this.sources.get(evidenceItem.sourceId);

    return source ? { source, evidenceItem } : undefined;
  }

  private findExistingEvidence(
    record: EvidenceRecord
  ): EvidenceRecord | undefined {
    if (!record.evidenceItem.canonicalUrl) {
      return undefined;
    }

    for (const evidenceItem of this.evidenceItems.values()) {
      if (evidenceItem.canonicalUrl === record.evidenceItem.canonicalUrl) {
        const source = this.sources.get(evidenceItem.sourceId);

        return source ? { source, evidenceItem } : undefined;
      }
    }

    return undefined;
  }

  private findReusableSource(
    source: EvidenceRecord["source"]
  ): EvidenceRecord["source"] | undefined {
    if (source.baseUrl) {
      for (const existingSource of this.sources.values()) {
        if (existingSource.baseUrl === source.baseUrl) {
          return existingSource;
        }
      }
    }

    for (const existingSource of this.sources.values()) {
      if (
        existingSource.canonicalName === source.canonicalName &&
        existingSource.sourceType === source.sourceType
      ) {
        return existingSource;
      }
    }

    return undefined;
  }
}
