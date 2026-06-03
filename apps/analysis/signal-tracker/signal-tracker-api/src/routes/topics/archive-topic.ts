import {
  isSignalTrackerProtectedDemoTopicId,
  signalTrackerRouteContracts,
  type Topic
} from "@repo/signal-tracker-shared";
import type { RouteHandler } from "@repo/api-core";

import {
  createProtectedDemoTopicArchiveDisabledError,
  createTopicNotFoundError
} from "../../app/errors";
import {
  createJsonRouteHandler,
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
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.archiveTopic,
    handle: async (request) => {
      const topic = await archiveTopicRecord(request.topicId, dependencies);

      return { topic };
    }
  });
}

async function archiveTopicRecord(
  topicId: string,
  dependencies: ArchiveTopicHandlerDependencies
): Promise<Topic> {
  if (isSignalTrackerProtectedDemoTopicId(topicId)) {
    throw createProtectedDemoTopicArchiveDisabledError();
  }

  const archivedAt = (dependencies.now ?? (() => new Date()))().toISOString();
  const topic = await persistTopicArchive(topicId, archivedAt, dependencies);

  if (!topic) {
    throw createTopicNotFoundError();
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
