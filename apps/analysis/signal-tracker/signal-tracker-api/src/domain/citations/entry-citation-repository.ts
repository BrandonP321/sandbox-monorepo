import type { EntryCitation } from "@repo/signal-tracker-shared";

export type EntryCitationRepository = {
  createOrFind(citation: EntryCitation): Promise<EntryCitation>;
  findById(id: string): Promise<EntryCitation | undefined>;
  listByEntry(entryId: string): Promise<EntryCitation[]>;
  deleteForEntry(
    entryId: string,
    citationId: string
  ): Promise<EntryCitation | undefined>;
};

export class InMemoryEntryCitationRepository implements EntryCitationRepository {
  private readonly citations = new Map<string, EntryCitation>();

  async createOrFind(citation: EntryCitation): Promise<EntryCitation> {
    const existingCitation = this.findMatchingCitation(citation);

    if (existingCitation) {
      return existingCitation;
    }

    this.citations.set(citation.id, citation);

    return citation;
  }

  async findById(id: string): Promise<EntryCitation | undefined> {
    return this.citations.get(id);
  }

  async listByEntry(entryId: string): Promise<EntryCitation[]> {
    return Array.from(this.citations.values())
      .filter((citation) => citation.entryId === entryId)
      .sort(compareEntryCitationsForList);
  }

  async deleteForEntry(
    entryId: string,
    citationId: string
  ): Promise<EntryCitation | undefined> {
    const citation = await this.findById(citationId);

    if (!citation || citation.entryId !== entryId) {
      return undefined;
    }

    this.citations.delete(citationId);

    return citation;
  }

  count(): number {
    return this.citations.size;
  }

  private findMatchingCitation(
    citation: EntryCitation
  ): EntryCitation | undefined {
    return Array.from(this.citations.values()).find(
      (existingCitation) =>
        existingCitation.entryId === citation.entryId &&
        existingCitation.evidenceItemId === citation.evidenceItemId &&
        existingCitation.evidenceAnchorId === citation.evidenceAnchorId &&
        existingCitation.relationType === citation.relationType
    );
  }
}

function compareEntryCitationsForList(
  left: EntryCitation,
  right: EntryCitation
): number {
  const createdAtComparison =
    new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();

  if (createdAtComparison !== 0) {
    return createdAtComparison;
  }

  return left.id.localeCompare(right.id);
}
