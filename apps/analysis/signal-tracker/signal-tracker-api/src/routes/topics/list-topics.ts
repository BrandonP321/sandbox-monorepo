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
import type { TopicRepository } from "../../domain/topics/topic-repository";

type ListTopicsHandlerDependencies = {
  repository: Pick<TopicRepository, "list">;
};

export function createListTopicsHandler(
  dependencies: ListTopicsHandlerDependencies
): RouteHandler {
  return async (request: ApiRequest) => {
    const parsedRequest = parseRequestBody(
      listTopicsRequestSchema,
      request.body
    );

    const topics = await readTopics(parsedRequest, dependencies);

    return okResponse(listTopicsResponseSchema, { topics });
  };
}

async function readTopics(
  input: Parameters<TopicRepository["list"]>[0],
  dependencies: ListTopicsHandlerDependencies
) {
  return withPersistenceErrorMapping(() => dependencies.repository.list(input));
}
