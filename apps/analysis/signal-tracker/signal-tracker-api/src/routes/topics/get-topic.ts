import {
  signalTrackerRouteContracts,
  type AssessmentUpdateReadModel,
  type Topic
} from "@repo/signal-tracker-shared";
import type { RouteHandler } from "@repo/api-core";

import { createTopicNotFoundError } from "../../app/errors";
import {
  createJsonRouteHandler,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import type { AssessmentRepository } from "../../domain/assessments/assessment-repository";
import { hydrateAssessmentUpdateReadModel } from "../../domain/entries/entry-read-models";
import type { EntrySourceSummaryRepository } from "../../domain/entries/entry-source-summary-repository";
import type { TopicRepository } from "../../domain/topics/topic-repository";

type GetTopicHandlerDependencies = {
  repository: Pick<TopicRepository, "findById">;
  assessmentRepository: Pick<AssessmentRepository, "findLatestActiveByTopic">;
  entrySourceSummaryRepository: EntrySourceSummaryRepository;
};

export function createGetTopicHandler(
  dependencies: GetTopicHandlerDependencies
): RouteHandler {
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.getTopic,
    handle: async (request) => {
      const topic = await findTopic(request.topicId, dependencies);
      const currentAssessment = await findCurrentAssessment(
        topic.id,
        dependencies
      );

      return {
        topic,
        currentAssessment
      };
    }
  });
}

async function findCurrentAssessment(
  topicId: string,
  dependencies: GetTopicHandlerDependencies
): Promise<AssessmentUpdateReadModel | null> {
  const assessmentUpdate = await withPersistenceErrorMapping(() =>
    dependencies.assessmentRepository.findLatestActiveByTopic(topicId)
  );

  if (!assessmentUpdate) {
    return null;
  }

  return withPersistenceErrorMapping(() =>
    hydrateAssessmentUpdateReadModel(
      assessmentUpdate,
      dependencies.entrySourceSummaryRepository
    )
  );
}

async function findTopic(
  topicId: string,
  dependencies: GetTopicHandlerDependencies
): Promise<Topic> {
  const topic = await findTopicById(topicId, dependencies);

  if (!topic) {
    throw createTopicNotFoundError();
  }

  return topic;
}

async function findTopicById(
  topicId: string,
  dependencies: GetTopicHandlerDependencies
): Promise<Topic | undefined> {
  return withPersistenceErrorMapping(() =>
    dependencies.repository.findById(topicId)
  );
}
