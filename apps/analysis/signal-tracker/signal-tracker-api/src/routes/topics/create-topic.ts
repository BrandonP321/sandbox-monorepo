import {
  signalTrackerRouteContracts,
  type CreateTopicRequest
} from "@repo/signal-tracker-shared";
import type { RouteHandler } from "@repo/api-core";

import {
  createJsonRouteHandler,
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
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.createTopic,
    handle: async (request) => {
      const topic = await persistTopic(request, dependencies);

      return { topic };
    }
  });
}

async function persistTopic(
  input: CreateTopicRequest,
  dependencies: CreateTopicHandlerDependencies
) {
  return withPersistenceErrorMapping(() =>
    createTopicRecord(input, dependencies)
  );
}
