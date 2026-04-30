import {
  AppError,
  responses,
  type ApiRequest,
  type RouteHandler
} from "@repo/api-core";
import {
  listTopicsRequestSchema,
  listTopicsResponseSchema
} from "@repo/signal-tracker-shared";

import { createPersistenceUnavailableError } from "../../app/errors";
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
    const payload = parseJsonBody(request.body);
    const parsedRequest = listTopicsRequestSchema.safeParse(payload);

    if (!parsedRequest.success) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Topic list request is invalid",
        400
      );
    }

    const topics = await readTopics(parsedRequest.data, dependencies);
    const response = listTopicsResponseSchema.parse({ topics });

    return responses.ok(response);
  };
}

export const listTopics = createListTopicsHandler();

async function readTopics(
  input: Parameters<TopicRepository["list"]>[0],
  dependencies: ListTopicsHandlerDependencies
) {
  try {
    return await dependencies.repository.list(input);
  } catch {
    throw createPersistenceUnavailableError();
  }
}

function parseJsonBody(body: string | null | undefined): unknown {
  if (!body) {
    return {};
  }

  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new AppError(
      "VALIDATION_ERROR",
      "Request body must be valid JSON",
      400
    );
  }
}
