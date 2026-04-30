import { AppError, type ApiRequest, type RouteHandler } from "@repo/api-core";
import {
  archiveTopicRequestSchema,
  archiveTopicResponseSchema,
  type Topic
} from "@repo/signal-tracker-shared";

import {
  okResponse,
  parseRequestBody,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import type { TopicRepository } from "../../domain/topics/topic-repository";

type ArchiveTopicHandlerDependencies = {
  repository: Pick<TopicRepository, "archive">;
  now?: () => Date;
};

export function createArchiveTopicHandler(
  dependencies: ArchiveTopicHandlerDependencies
): RouteHandler {
  return async (request: ApiRequest) => {
    const parsedRequest = parseRequestBody(
      archiveTopicRequestSchema,
      request.body
    );

    const topic = await archiveTopicRecord(parsedRequest.topicId, dependencies);

    return okResponse(archiveTopicResponseSchema, { topic });
  };
}

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
  return withPersistenceErrorMapping(() =>
    dependencies.repository.archive(topicId, archivedAt)
  );
}
