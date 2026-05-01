import type { AssessmentUpdate } from "@repo/signal-tracker-shared";

export type AssessmentRepository = {
  create(assessmentUpdate: AssessmentUpdate): Promise<AssessmentUpdate>;
  findLatestActiveByTopic(
    topicId: string
  ): Promise<AssessmentUpdate | undefined>;
  listActiveByTopic(topicId: string): Promise<AssessmentUpdate[]>;
};

export class InMemoryAssessmentRepository implements AssessmentRepository {
  private readonly assessmentUpdates = new Map<string, AssessmentUpdate>();

  async create(assessmentUpdate: AssessmentUpdate): Promise<AssessmentUpdate> {
    this.assessmentUpdates.set(assessmentUpdate.entry.id, assessmentUpdate);
    return assessmentUpdate;
  }

  async findLatestActiveByTopic(
    topicId: string
  ): Promise<AssessmentUpdate | undefined> {
    return Array.from(this.assessmentUpdates.values())
      .filter(
        (assessmentUpdate) =>
          assessmentUpdate.entry.topicId === topicId &&
          assessmentUpdate.entry.kind === "assessment" &&
          assessmentUpdate.entry.status === "active"
      )
      .sort(compareAssessmentUpdatesForList)[0];
  }

  async listActiveByTopic(topicId: string): Promise<AssessmentUpdate[]> {
    return Array.from(this.assessmentUpdates.values())
      .filter(
        (assessmentUpdate) =>
          assessmentUpdate.entry.topicId === topicId &&
          assessmentUpdate.entry.kind === "assessment" &&
          assessmentUpdate.entry.status === "active"
      )
      .sort(compareAssessmentUpdatesForList);
  }
}

function compareAssessmentUpdatesForList(
  left: AssessmentUpdate,
  right: AssessmentUpdate
): number {
  const sortAtComparison = right.entry.sortAt.localeCompare(left.entry.sortAt);

  if (sortAtComparison !== 0) {
    return sortAtComparison;
  }

  const createdAtComparison = right.entry.createdAt.localeCompare(
    left.entry.createdAt
  );

  if (createdAtComparison !== 0) {
    return createdAtComparison;
  }

  return left.entry.id.localeCompare(right.entry.id);
}
