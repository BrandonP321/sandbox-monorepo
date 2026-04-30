import { AppError, type ApiRequest, type RouteHandler } from "@repo/api-core";
import {
  deleteTopicRequestSchema,
  deleteTopicResponseSchema,
  type Topic
} from "@repo/signal-tracker-shared";

import {
  okResponse,
  parseRequestBody,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import { PostgresTopicRepository } from "../../domain/topics/postgres-topic-repository";
import type { TopicRepository } from "../../domain/topics/topic-repository";

type DeleteTopicHandlerDependencies = {
  repository: TopicRepository;
};

const defaultTopicRepository = new PostgresTopicRepository();

export function createDeleteTopicHandler(
  dependencies: DeleteTopicHandlerDependencies = {
    repository: defaultTopicRepository
  }
): RouteHandler {
  return async (request: ApiRequest) => {
    const parsedRequest = parseRequestBody(
      deleteTopicRequestSchema,
      request.body,
      {
        invalidMessage: "Topic delete request is invalid"
      }
    );

    const topic = await deleteTopicRecord(parsedRequest.topicId, dependencies);

    return okResponse(deleteTopicResponseSchema, { topic });
  };
}

export const deleteTopic = createDeleteTopicHandler();

async function deleteTopicRecord(
  topicId: string,
  dependencies: DeleteTopicHandlerDependencies
): Promise<Topic> {
  const topic = await persistTopicDelete(topicId, dependencies);

  if (!topic) {
    throw new AppError("TOPIC_NOT_FOUND", "Topic not found", 404);
  }

  return topic;
}

async function persistTopicDelete(
  topicId: string,
  dependencies: DeleteTopicHandlerDependencies
): Promise<Topic | undefined> {
  return withPersistenceErrorMapping(() =>
    dependencies.repository.delete(topicId)
  );
}
