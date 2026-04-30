import { randomUUID } from "node:crypto";

import {
  assessmentUpdateSchema,
  entrySchema,
  type AssessmentUpdate,
  type CreateAssessmentUpdateRequest,
  type Entry
} from "@repo/signal-tracker-shared";

import { EntryTopicNotFoundError } from "../entries/create-entry";
import type { TopicRepository } from "../topics/topic-repository";
import type { AssessmentRepository } from "./assessment-repository";

export type CreateAssessmentUpdateDependencies = {
  assessmentRepository: AssessmentRepository;
  topicRepository: Pick<TopicRepository, "findById">;
  generateId?: () => string;
  now?: () => Date;
};

export async function createAssessmentUpdateRecord(
  input: CreateAssessmentUpdateRequest,
  dependencies: CreateAssessmentUpdateDependencies
): Promise<AssessmentUpdate> {
  const topic = await dependencies.topicRepository.findById(input.topicId);

  if (!topic) {
    throw new EntryTopicNotFoundError(input.topicId);
  }

  const previousAssessment =
    await dependencies.assessmentRepository.findLatestActiveByTopic(
      input.topicId
    );
  const timestamp = (dependencies.now ?? (() => new Date()))().toISOString();
  const entry = createAssessmentEntry(input, {
    id: (dependencies.generateId ?? randomUUID)(),
    timestamp
  });
  const assessmentUpdate = assessmentUpdateSchema.parse({
    entry,
    judgment: input.judgment,
    confidenceLabel: input.confidenceLabel,
    probabilityPct: input.probabilityPct,
    assumptions: input.assumptions,
    indicators: input.indicators,
    resolutionCriteria: input.resolutionCriteria,
    targetResolvesAt: input.targetResolvesAt,
    previousAssessmentEntryId: previousAssessment?.entry.id
  });

  return await dependencies.assessmentRepository.create(assessmentUpdate);
}

function createAssessmentEntry(
  input: CreateAssessmentUpdateRequest,
  options: { id: string; timestamp: string }
): Entry {
  return entrySchema.parse({
    id: options.id,
    topicId: input.topicId,
    kind: "assessment",
    epistemicStatus: "forecast",
    title: input.title ?? createGeneratedAssessmentTitle(input.sortAt),
    bodyMd: input.judgment,
    sortAt: input.sortAt,
    isApproximateDate: false,
    originType: "manual",
    status: "active",
    createdAt: options.timestamp,
    updatedAt: options.timestamp
  });
}

function createGeneratedAssessmentTitle(sortAt: string): string {
  return `Assessment update - ${sortAt.slice(0, 10)}`;
}
