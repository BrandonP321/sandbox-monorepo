import { AppError, type ApiRequest, type RouteHandler } from "@repo/api-core";
import {
  getTopicRequestSchema,
  getTopicResponseSchema,
  type AssessmentUpdate,
  type Topic
} from "@repo/signal-tracker-shared";

import {
  okResponse,
  parseRequestBody,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import type { AssessmentRepository } from "../../domain/assessments/assessment-repository";
import type { TopicRepository } from "../../domain/topics/topic-repository";

type GetTopicHandlerDependencies = {
  repository: Pick<TopicRepository, "findById">;
  assessmentRepository: Pick<AssessmentRepository, "findLatestActiveByTopic">;
};

export function createGetTopicHandler(
  dependencies: GetTopicHandlerDependencies
): RouteHandler {
  return async (request: ApiRequest) => {
    const parsedRequest = parseRequestBody(getTopicRequestSchema, request.body);

    const topic = await findTopic(parsedRequest.topicId, dependencies);
    const currentAssessment = await findCurrentAssessment(
      topic.id,
      dependencies
    );

    return okResponse(getTopicResponseSchema, {
      topic,
      currentAssessment
    });
  };
}

async function findCurrentAssessment(
  topicId: string,
  dependencies: GetTopicHandlerDependencies
): Promise<AssessmentUpdate | null> {
  return (
    (await withPersistenceErrorMapping(() =>
      dependencies.assessmentRepository.findLatestActiveByTopic(topicId)
    )) ?? null
  );
}

async function findTopic(
  topicId: string,
  dependencies: GetTopicHandlerDependencies
): Promise<Topic> {
  const topic = await findTopicById(topicId, dependencies);

  if (!topic) {
    throw new AppError("TOPIC_NOT_FOUND", "Topic not found", 404);
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
