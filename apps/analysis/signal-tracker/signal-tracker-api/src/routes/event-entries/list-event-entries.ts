import {
  signalTrackerRouteContracts,
  type Entry
} from "@repo/signal-tracker-shared";
import type { RouteHandler } from "@repo/api-core";

import {
  createJsonRouteHandler,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import type { EntryRepository } from "../../domain/entries/entry-repository";

type ListEventEntriesHandlerDependencies = {
  entryRepository: Pick<EntryRepository, "listByTopic">;
};

export function createListEventEntriesHandler(
  dependencies: ListEventEntriesHandlerDependencies
): RouteHandler {
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.listEventEntries,
    handle: async (request) => {
      const entries = await listActiveEventEntries(
        request.topicId,
        dependencies
      );

      return { entries };
    }
  });
}

async function listActiveEventEntries(
  topicId: string,
  dependencies: ListEventEntriesHandlerDependencies
): Promise<Entry[]> {
  return withPersistenceErrorMapping(async () => {
    const entries = await dependencies.entryRepository.listByTopic(topicId);

    return entries.filter((entry) => entry.kind === "event");
  });
}
