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
import { PostgresAssessmentRepository } from "../../domain/assessments/postgres-assessment-repository";
import type { AssessmentRepository } from "../../domain/assessments/assessment-repository";
import { PostgresTopicRepository } from "../../domain/topics/postgres-topic-repository";
import type { TopicRepository } from "../../domain/topics/topic-repository";

type GetTopicHandlerDependencies = {
  repository: TopicRepository;
  assessmentRepository: AssessmentRepository;
};

const defaultTopicRepository = new PostgresTopicRepository();
const defaultAssessmentRepository = new PostgresAssessmentRepository();

export function createGetTopicHandler(
  dependencies: GetTopicHandlerDependencies = {
    repository: defaultTopicRepository,
    assessmentRepository: defaultAssessmentRepository
  }
): RouteHandler {
  return async (request: ApiRequest) => {
    const parsedRequest = parseRequestBody(
      getTopicRequestSchema,
      request.body,
      {
        invalidMessage: "Topic read request is invalid"
      }
    );

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

export const getTopic = createGetTopicHandler();

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
