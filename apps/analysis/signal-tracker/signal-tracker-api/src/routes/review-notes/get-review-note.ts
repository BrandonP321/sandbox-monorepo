import {
  signalTrackerRouteContracts,
  type Entry,
  type EntryReadModel
} from "@repo/signal-tracker-shared";
import type { RouteHandler } from "@repo/api-core";

import { createReviewNoteNotFoundError } from "../../app/errors";
import {
  createJsonRouteHandler,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import type { EntryRepository } from "../../domain/entries/entry-repository";
import { hydrateEntryReadModel } from "../../domain/entries/entry-read-models";
import type { EntrySourceSummaryRepository } from "../../domain/entries/entry-source-summary-repository";

type GetReviewNoteHandlerDependencies = {
  entryRepository: Pick<EntryRepository, "findById">;
  entrySourceSummaryRepository: EntrySourceSummaryRepository;
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
): Promise<EntryReadModel> {
  const entry = await findEntryById(entryId, dependencies);

  if (!entry || entry.kind !== "review") {
    throw createReviewNoteNotFoundError();
  }

  return withPersistenceErrorMapping(() =>
    hydrateEntryReadModel(entry, dependencies.entrySourceSummaryRepository)
  );
}

async function findEntryById(
  entryId: string,
  dependencies: GetReviewNoteHandlerDependencies
): Promise<Entry | undefined> {
  return withPersistenceErrorMapping(() =>
    dependencies.entryRepository.findById(entryId)
  );
}
