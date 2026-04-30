import type { RouteHandler } from "@repo/api-core";
import { signalTrackerRouteContracts } from "@repo/signal-tracker-shared";

import {
  createJsonRouteHandler,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import type { TopicRepository } from "../../domain/topics/topic-repository";

type ListTopicsHandlerDependencies = {
  repository: Pick<TopicRepository, "list">;
};

export function createListTopicsHandler(
  dependencies: ListTopicsHandlerDependencies
): RouteHandler {
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.listTopics,
    handle: async (request) => {
      const topics = await readTopics(request, dependencies);

      return { topics };
    }
  });
}

async function readTopics(
  input: Parameters<TopicRepository["list"]>[0],
  dependencies: ListTopicsHandlerDependencies
) {
  return withPersistenceErrorMapping(() => dependencies.repository.list(input));
}
