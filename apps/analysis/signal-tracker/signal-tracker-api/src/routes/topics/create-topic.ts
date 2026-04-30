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
import type { TopicRepository } from "../../domain/topics/topic-repository";

type CreateTopicHandlerDependencies = {
  repository: Pick<TopicRepository, "create">;
  createId?: () => string;
  now?: () => Date;
};

export function createCreateTopicHandler(
  dependencies: CreateTopicHandlerDependencies
): RouteHandler {
  return async (request: ApiRequest) => {
    const parsedRequest = parseRequestBody(
      createTopicRequestSchema,
      request.body
    );
    const topic = await persistTopic(parsedRequest, dependencies);

    return okResponse(createTopicResponseSchema, { topic });
  };
}

async function persistTopic(
  input: Parameters<typeof createTopicRecord>[0],
  dependencies: CreateTopicHandlerDependencies
) {
  return withPersistenceErrorMapping(() =>
    createTopicRecord(input, dependencies)
  );
}
