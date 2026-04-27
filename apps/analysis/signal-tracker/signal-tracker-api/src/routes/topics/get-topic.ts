import {
  AppError,
  responses,
  type ApiRequest,
  type RouteHandler
} from "@repo/api-core";
import {
  getTopicRequestSchema,
  getTopicResponseSchema,
  type Topic
} from "@repo/signal-tracker-shared";

import { PostgresTopicRepository } from "../../domain/topics/postgres-topic-repository";
import type { TopicRepository } from "../../domain/topics/topic-repository";

type GetTopicHandlerDependencies = {
  repository: TopicRepository;
};

const defaultTopicRepository = new PostgresTopicRepository();

export function createGetTopicHandler(
  dependencies: GetTopicHandlerDependencies = {
    repository: defaultTopicRepository
  }
): RouteHandler {
  return async (request: ApiRequest) => {
    const payload = parseJsonBody(request.body);
    const parsedRequest = getTopicRequestSchema.safeParse(payload);

    if (!parsedRequest.success) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Topic read request is invalid",
        400
      );
    }

    const topic = await findTopic(parsedRequest.data.topicId, dependencies);
    const response = getTopicResponseSchema.parse({ topic });

    return responses.ok(response);
  };
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
  try {
    return await dependencies.repository.findById(topicId);
  } catch {
    throw new AppError(
      "PERSISTENCE_UNAVAILABLE",
      "Topic persistence is temporarily unavailable",
      503
    );
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
