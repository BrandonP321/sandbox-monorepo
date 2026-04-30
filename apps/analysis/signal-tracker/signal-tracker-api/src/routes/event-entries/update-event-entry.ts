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
import type {
  EntryRepository,
  UpdateEntryFields
} from "../../domain/entries/entry-repository";

type UpdateEventEntryHandlerDependencies = {
  entryRepository: Pick<EntryRepository, "findById" | "update">;
  now?: () => Date;
};

export function createUpdateEventEntryHandler(
  dependencies: UpdateEventEntryHandlerDependencies
): RouteHandler {
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.updateEventEntry,
    handle: async (request) => {
      const { entryId, ...updates } = request;
      const entry = await updateEventEntryRecord(
        entryId,
        updates,
        dependencies
      );

      return { entry };
    }
  });
}

async function updateEventEntryRecord(
  entryId: string,
  updates: UpdateEntryFields,
  dependencies: UpdateEventEntryHandlerDependencies
): Promise<Entry> {
  const existingEntry = await findEntryById(entryId, dependencies);

  if (!existingEntry || existingEntry.kind !== "event") {
    throw createEventEntryNotFoundError();
  }

  const updatedAt = (dependencies.now ?? (() => new Date()))().toISOString();
  const updatedEntry = await persistEntryUpdate(
    entryId,
    updates,
    updatedAt,
    dependencies
  );

  if (!updatedEntry || updatedEntry.kind !== "event") {
    throw createEventEntryNotFoundError();
  }

  return updatedEntry;
}

async function findEntryById(
  entryId: string,
  dependencies: UpdateEventEntryHandlerDependencies
): Promise<Entry | undefined> {
  return withPersistenceErrorMapping(() =>
    dependencies.entryRepository.findById(entryId)
  );
}

async function persistEntryUpdate(
  entryId: string,
  updates: UpdateEntryFields,
  updatedAt: string,
  dependencies: UpdateEventEntryHandlerDependencies
): Promise<Entry | undefined> {
  return withPersistenceErrorMapping(() =>
    dependencies.entryRepository.update(entryId, updates, updatedAt)
  );
}
