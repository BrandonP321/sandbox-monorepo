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

type ListReviewNotesHandlerDependencies = {
  entryRepository: Pick<EntryRepository, "listByTopic">;
};

export function createListReviewNotesHandler(
  dependencies: ListReviewNotesHandlerDependencies
): RouteHandler {
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.listReviewNotes,
    handle: async (request) => {
      const entries = await listActiveReviewNotes(
        request.topicId,
        dependencies
      );

      return { entries };
    }
  });
}

async function listActiveReviewNotes(
  topicId: string,
  dependencies: ListReviewNotesHandlerDependencies
): Promise<Entry[]> {
  return withPersistenceErrorMapping(async () => {
    const entries = await dependencies.entryRepository.listByTopic(topicId);

    return entries.filter((entry) => entry.kind === "review");
  });
}
