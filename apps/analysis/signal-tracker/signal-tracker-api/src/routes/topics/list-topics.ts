import { type ApiRequest, type RouteHandler } from "@repo/api-core";
import {
  listTopicsRequestSchema,
  listTopicsResponseSchema
} from "@repo/signal-tracker-shared";

import {
  okResponse,
  parseRequestBody,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import { PostgresTopicRepository } from "../../domain/topics/postgres-topic-repository";
import type { TopicRepository } from "../../domain/topics/topic-repository";

type ListTopicsHandlerDependencies = {
  repository: TopicRepository;
};

const defaultTopicRepository = new PostgresTopicRepository();

export function createListTopicsHandler(
  dependencies: ListTopicsHandlerDependencies = {
    repository: defaultTopicRepository
  }
): RouteHandler {
  return async (request: ApiRequest) => {
    const parsedRequest = parseRequestBody(
      listTopicsRequestSchema,
      request.body,
      {
        invalidMessage: "Topic list request is invalid"
      }
    );

    const topics = await readTopics(parsedRequest, dependencies);

    return okResponse(listTopicsResponseSchema, { topics });
  };
}

export const listTopics = createListTopicsHandler();

async function readTopics(
  input: Parameters<TopicRepository["list"]>[0],
  dependencies: ListTopicsHandlerDependencies
) {
  return withPersistenceErrorMapping(() => dependencies.repository.list(input));
}
