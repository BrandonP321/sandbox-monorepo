import {
  AppError,
  responses,
  type ApiRequest,
  type RouteHandler
} from "@repo/api-core";
import {
  deleteTopicRequestSchema,
  deleteTopicResponseSchema,
  type Topic
} from "@repo/signal-tracker-shared";

import { createPersistenceUnavailableError } from "../../app/errors";
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
    const payload = parseJsonBody(request.body);
    const parsedRequest = deleteTopicRequestSchema.safeParse(payload);

    if (!parsedRequest.success) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Topic delete request is invalid",
        400
      );
    }

    const topic = await deleteTopicRecord(
      parsedRequest.data.topicId,
      dependencies
    );
    const response = deleteTopicResponseSchema.parse({ topic });

    return responses.ok(response);
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
  try {
    return await dependencies.repository.delete(topicId);
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
