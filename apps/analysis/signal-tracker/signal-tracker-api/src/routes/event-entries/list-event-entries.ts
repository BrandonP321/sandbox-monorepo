import {
  signalTrackerRouteContracts,
  type EntryReadModel
} from "@repo/signal-tracker-shared";
import type { RouteHandler } from "@repo/api-core";

import {
  createJsonRouteHandler,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import type { EntryRepository } from "../../domain/entries/entry-repository";
import { hydrateEntryReadModels } from "../../domain/entries/entry-read-models";
import type { EntrySourceSummaryRepository } from "../../domain/entries/entry-source-summary-repository";

type ListEventEntriesHandlerDependencies = {
  entryRepository: Pick<EntryRepository, "listByTopic">;
  entrySourceSummaryRepository: EntrySourceSummaryRepository;
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
): Promise<EntryReadModel[]> {
  return withPersistenceErrorMapping(async () => {
    const entries = await dependencies.entryRepository.listByTopic(topicId);

    return await hydrateEntryReadModels(
      entries.filter((entry) => entry.kind === "event"),
      dependencies.entrySourceSummaryRepository
    );
  });
}
