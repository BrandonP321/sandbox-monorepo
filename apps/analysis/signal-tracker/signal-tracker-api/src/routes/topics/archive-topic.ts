import {
  AppError,
  responses,
  type ApiRequest,
  type RouteHandler
} from "@repo/api-core";
import {
  archiveTopicRequestSchema,
  archiveTopicResponseSchema,
  type Topic
} from "@repo/signal-tracker-shared";

import { createPersistenceUnavailableError } from "../../app/errors";
import { PostgresTopicRepository } from "../../domain/topics/postgres-topic-repository";
import type { TopicRepository } from "../../domain/topics/topic-repository";

type ArchiveTopicHandlerDependencies = {
  repository: TopicRepository;
  now?: () => Date;
};

const defaultTopicRepository = new PostgresTopicRepository();

export function createArchiveTopicHandler(
  dependencies: ArchiveTopicHandlerDependencies = {
    repository: defaultTopicRepository
  }
): RouteHandler {
  return async (request: ApiRequest) => {
    const payload = parseJsonBody(request.body);
    const parsedRequest = archiveTopicRequestSchema.safeParse(payload);

    if (!parsedRequest.success) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Topic archive request is invalid",
        400
      );
    }

    const topic = await archiveTopicRecord(
      parsedRequest.data.topicId,
      dependencies
    );
    const response = archiveTopicResponseSchema.parse({ topic });

    return responses.ok(response);
  };
}

export const archiveTopic = createArchiveTopicHandler();

async function archiveTopicRecord(
  topicId: string,
  dependencies: ArchiveTopicHandlerDependencies
): Promise<Topic> {
  const archivedAt = (dependencies.now ?? (() => new Date()))().toISOString();
  const topic = await persistTopicArchive(topicId, archivedAt, dependencies);

  if (!topic) {
    throw new AppError("TOPIC_NOT_FOUND", "Topic not found", 404);
  }

  return topic;
}

async function persistTopicArchive(
  topicId: string,
  archivedAt: string,
  dependencies: ArchiveTopicHandlerDependencies
): Promise<Topic | undefined> {
  try {
    return await dependencies.repository.archive(topicId, archivedAt);
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
