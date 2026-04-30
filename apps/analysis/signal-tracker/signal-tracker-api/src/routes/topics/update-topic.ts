import { AppError, type ApiRequest, type RouteHandler } from "@repo/api-core";
import {
  updateTopicRequestSchema,
  updateTopicResponseSchema,
  type Topic
} from "@repo/signal-tracker-shared";

import {
  okResponse,
  parseRequestBody,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import { PostgresTopicRepository } from "../../domain/topics/postgres-topic-repository";
import type { TopicRepository } from "../../domain/topics/topic-repository";

type UpdateTopicHandlerDependencies = {
  repository: TopicRepository;
  now?: () => Date;
};

const defaultTopicRepository = new PostgresTopicRepository();

export function createUpdateTopicHandler(
  dependencies: UpdateTopicHandlerDependencies = {
    repository: defaultTopicRepository
  }
): RouteHandler {
  return async (request: ApiRequest) => {
    const parsedRequest = parseRequestBody(
      updateTopicRequestSchema,
      request.body,
      {
        invalidMessage: "Topic update request is invalid"
      }
    );

    const { topicId, ...updates } = parsedRequest;
    const topic = await updateTopicRecord(topicId, updates, dependencies);

    return okResponse(updateTopicResponseSchema, { topic });
  };
}

export const updateTopic = createUpdateTopicHandler();

async function updateTopicRecord(
  topicId: string,
  updates: Parameters<TopicRepository["update"]>[1],
  dependencies: UpdateTopicHandlerDependencies
): Promise<Topic> {
  const updatedAt = (dependencies.now ?? (() => new Date()))().toISOString();
  const topic = await persistTopicUpdate(
    topicId,
    updates,
    updatedAt,
    dependencies
  );

  if (!topic) {
    throw new AppError("TOPIC_NOT_FOUND", "Topic not found", 404);
  }

  return topic;
}

async function persistTopicUpdate(
  topicId: string,
  updates: Parameters<TopicRepository["update"]>[1],
  updatedAt: string,
  dependencies: UpdateTopicHandlerDependencies
): Promise<Topic | undefined> {
  return withPersistenceErrorMapping(() =>
    dependencies.repository.update(topicId, updates, updatedAt)
  );
}
