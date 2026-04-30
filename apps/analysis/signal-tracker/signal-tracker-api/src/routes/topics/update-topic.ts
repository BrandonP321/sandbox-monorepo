import {
  signalTrackerRouteContracts,
  type Topic
} from "@repo/signal-tracker-shared";
import type { RouteHandler } from "@repo/api-core";

import { createTopicNotFoundError } from "../../app/errors";
import {
  createJsonRouteHandler,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import type { TopicRepository } from "../../domain/topics/topic-repository";

type UpdateTopicHandlerDependencies = {
  repository: Pick<TopicRepository, "update">;
  now?: () => Date;
};

export function createUpdateTopicHandler(
  dependencies: UpdateTopicHandlerDependencies
): RouteHandler {
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.updateTopic,
    handle: async (request) => {
      const { topicId, ...updates } = request;
      const topic = await updateTopicRecord(topicId, updates, dependencies);

      return { topic };
    }
  });
}

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
    throw createTopicNotFoundError();
  }

  return topic;
}

async function persistTopicUpdate(
  topicId: string,
  updates: Parameters<TopicRepository["update"]>[1],
  updatedAt: string,
  dependencies: UpdateTopicHandlerDependencies
): Promise<Topic | undefined> {
  return withPersistenceErrorMapping(() =>
    dependencies.repository.update(topicId, updates, updatedAt)
  );
}
