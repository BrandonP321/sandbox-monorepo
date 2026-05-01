import {
  signalTrackerRouteContracts,
  type Entry
} from "@repo/signal-tracker-shared";
import type { RouteHandler } from "@repo/api-core";

import { createReviewNoteNotFoundError } from "../../app/errors";
import {
  createJsonRouteHandler,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import type { EntryRepository } from "../../domain/entries/entry-repository";

type GetReviewNoteHandlerDependencies = {
  entryRepository: Pick<EntryRepository, "findById">;
};

export function createGetReviewNoteHandler(
  dependencies: GetReviewNoteHandlerDependencies
): RouteHandler {
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.getReviewNote,
    handle: async (request) => {
      const entry = await findReviewNote(request.entryId, dependencies);

      return { entry };
    }
  });
}

async function findReviewNote(
  entryId: string,
  dependencies: GetReviewNoteHandlerDependencies
): Promise<Entry> {
  const entry = await findEntryById(entryId, dependencies);

  if (!entry || entry.kind !== "review") {
    throw createReviewNoteNotFoundError();
  }

  return entry;
}

async function findEntryById(
  entryId: string,
  dependencies: GetReviewNoteHandlerDependencies
): Promise<Entry | undefined> {
  return withPersistenceErrorMapping(() =>
    dependencies.entryRepository.findById(entryId)
  );
}
