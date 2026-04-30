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

type DeleteTopicHandlerDependencies = {
  repository: Pick<TopicRepository, "delete">;
};

export function createDeleteTopicHandler(
  dependencies: DeleteTopicHandlerDependencies
): RouteHandler {
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.deleteTopic,
    handle: async (request) => {
      const topic = await deleteTopicRecord(request.topicId, dependencies);

      return { topic };
    }
  });
}

async function deleteTopicRecord(
  topicId: string,
  dependencies: DeleteTopicHandlerDependencies
): Promise<Topic> {
  const topic = await persistTopicDelete(topicId, dependencies);

  if (!topic) {
    throw createTopicNotFoundError();
  }

  return topic;
}

async function persistTopicDelete(
  topicId: string,
  dependencies: DeleteTopicHandlerDependencies
): Promise<Topic | undefined> {
  return withPersistenceErrorMapping(() =>
    dependencies.repository.delete(topicId)
  );
}
