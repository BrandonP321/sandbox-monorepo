import {
  AppError,
  responses,
  type ApiRequest,
  type RouteHandler
} from "@repo/api-core";
import {
  updateTopicRequestSchema,
  updateTopicResponseSchema,
  type Topic
} from "@repo/signal-tracker-shared";

import { createPersistenceUnavailableError } from "../../app/errors";
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
    const payload = parseJsonBody(request.body);
    const parsedRequest = updateTopicRequestSchema.safeParse(payload);

    if (!parsedRequest.success) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Topic update request is invalid",
        400
      );
    }

    const { topicId, ...updates } = parsedRequest.data;
    const topic = await updateTopicRecord(topicId, updates, dependencies);
    const response = updateTopicResponseSchema.parse({ topic });

    return responses.ok(response);
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
  try {
    return await dependencies.repository.update(topicId, updates, updatedAt);
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
