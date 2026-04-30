import {
  signalTrackerRouteContracts,
  type Entry
} from "@repo/signal-tracker-shared";
import type { RouteHandler } from "@repo/api-core";

import { createEventEntryNotFoundError } from "../../app/errors";
import {
  createJsonRouteHandler,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import type { EntryRepository } from "../../domain/entries/entry-repository";

type GetEventEntryHandlerDependencies = {
  entryRepository: Pick<EntryRepository, "findById">;
};

export function createGetEventEntryHandler(
  dependencies: GetEventEntryHandlerDependencies
): RouteHandler {
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.getEventEntry,
    handle: async (request) => {
      const entry = await findEventEntry(request.entryId, dependencies);

      return { entry };
    }
  });
}

async function findEventEntry(
  entryId: string,
  dependencies: GetEventEntryHandlerDependencies
): Promise<Entry> {
  const entry = await findEntryById(entryId, dependencies);

  if (!entry || entry.kind !== "event") {
    throw createEventEntryNotFoundError();
  }

  return entry;
}

async function findEntryById(
  entryId: string,
  dependencies: GetEventEntryHandlerDependencies
): Promise<Entry | undefined> {
  return withPersistenceErrorMapping(() =>
    dependencies.entryRepository.findById(entryId)
  );
}
