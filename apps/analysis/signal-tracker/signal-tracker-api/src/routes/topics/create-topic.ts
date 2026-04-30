import { type ApiRequest, type RouteHandler } from "@repo/api-core";
import {
  createTopicRequestSchema,
  createTopicResponseSchema
} from "@repo/signal-tracker-shared";

import {
  okResponse,
  parseRequestBody,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import { createTopicRecord } from "../../domain/topics/create-topic";
import { PostgresTopicRepository } from "../../domain/topics/postgres-topic-repository";
import type { TopicRepository } from "../../domain/topics/topic-repository";

type CreateTopicHandlerDependencies = {
  repository: TopicRepository;
  createId?: () => string;
  now?: () => Date;
};

const defaultTopicRepository = new PostgresTopicRepository();

export function createCreateTopicHandler(
  dependencies: CreateTopicHandlerDependencies = {
    repository: defaultTopicRepository
  }
): RouteHandler {
  return async (request: ApiRequest) => {
    const parsedRequest = parseRequestBody(
      createTopicRequestSchema,
      request.body,
      {
        invalidMessage: "Topic creation request is invalid"
      }
    );
    const topic = await persistTopic(parsedRequest, dependencies);

    return okResponse(createTopicResponseSchema, { topic });
  };
}

export const createTopic = createCreateTopicHandler();

async function persistTopic(
  input: Parameters<typeof createTopicRecord>[0],
  dependencies: CreateTopicHandlerDependencies
) {
  return withPersistenceErrorMapping(() =>
    createTopicRecord(input, dependencies)
  );
}
