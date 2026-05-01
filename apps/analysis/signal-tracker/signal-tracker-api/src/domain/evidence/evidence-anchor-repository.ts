import type { EvidenceAnchor } from "@repo/signal-tracker-shared";

export type EvidenceAnchorRepository = {
  create(anchor: EvidenceAnchor): Promise<EvidenceAnchor>;
  findById(id: string): Promise<EvidenceAnchor | undefined>;
  listByEvidenceItemId(evidenceItemId: string): Promise<EvidenceAnchor[]>;
};

export class InMemoryEvidenceAnchorRepository implements EvidenceAnchorRepository {
  private readonly anchors = new Map<string, EvidenceAnchor>();

  async create(anchor: EvidenceAnchor): Promise<EvidenceAnchor> {
    this.anchors.set(anchor.id, anchor);

    return anchor;
  }

  async findById(id: string): Promise<EvidenceAnchor | undefined> {
    return this.anchors.get(id);
  }

  async listByEvidenceItemId(
    evidenceItemId: string
  ): Promise<EvidenceAnchor[]> {
    return Array.from(this.anchors.values())
      .filter((anchor) => anchor.evidenceItemId === evidenceItemId)
      .sort(compareEvidenceAnchorsForList);
  }
}

function compareEvidenceAnchorsForList(
  left: EvidenceAnchor,
  right: EvidenceAnchor
): number {
  const createdAtComparison =
    new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();

  if (createdAtComparison !== 0) {
    return createdAtComparison;
  }

  return left.id.localeCompare(right.id);
}
