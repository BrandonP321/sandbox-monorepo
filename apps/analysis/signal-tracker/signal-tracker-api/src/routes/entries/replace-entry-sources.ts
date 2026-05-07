import {
  signalTrackerRouteContracts,
  type Entry,
  type ReplaceEntrySourcesRequest,
  type ReplaceEntrySourcesResponse
} from "@repo/signal-tracker-shared";
import type { RouteHandler } from "@repo/api-core";

import {
  createJsonRouteHandler,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import { createEntryNotFoundError } from "../../app/errors";
import type { SignalTrackerApiDependencies } from "../../app/dependencies";
import type { EntryCitationRepository } from "../../domain/citations/entry-citation-repository";
import type { EntryRepository } from "../../domain/entries/entry-repository";
import { replaceEntrySourceAttachments } from "../../domain/entries/entry-source-attachments";
import type { EvidenceRepository } from "../../domain/evidence/evidence-repository";

type ReplaceEntrySourcesHandlerDependencies = {
  entryRepository: Pick<EntryRepository, "findById" | "update">;
  evidenceRepository: Pick<EvidenceRepository, "create">;
  entryCitationRepository: Pick<
    EntryCitationRepository,
    "createOrFind" | "listByEntry" | "deleteForEntry"
  >;
  generateId?: () => string;
  now?: () => Date;
  runInTransaction?: SignalTrackerApiDependencies["runInTransaction"];
};

export function createReplaceEntrySourcesHandler(
  dependencies: ReplaceEntrySourcesHandlerDependencies
): RouteHandler {
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.replaceEntrySources,
    handle: async (request) =>
      withPersistenceErrorMapping(() =>
        replaceSourcesForEntry(request, dependencies)
      )
  });
}

async function replaceSourcesForEntry(
  input: ReplaceEntrySourcesRequest,
  dependencies: ReplaceEntrySourcesHandlerDependencies
): Promise<ReplaceEntrySourcesResponse> {
  if (dependencies.runInTransaction) {
    return await dependencies.runInTransaction((transactionDependencies) =>
      replaceSourcesForEntryWithDependencies(input, {
        ...transactionDependencies,
        generateId: dependencies.generateId,
        now: dependencies.now
      })
    );
  }

  return await replaceSourcesForEntryWithDependencies(input, dependencies);
}

async function replaceSourcesForEntryWithDependencies(
  input: ReplaceEntrySourcesRequest,
  dependencies: ReplaceEntrySourcesHandlerDependencies
): Promise<ReplaceEntrySourcesResponse> {
  const entry = await findEntryById(input.entryId, dependencies);

  if (!entry) {
    throw createEntryNotFoundError();
  }

  await replaceEntrySourceAttachments(input.entryId, input.sources, {
    evidenceRepository: dependencies.evidenceRepository,
    entryCitationRepository: dependencies.entryCitationRepository,
    generateId: dependencies.generateId,
    now: dependencies.now
  });

  const updatedEntry = await touchEntry(entry.id, dependencies);

  if (!updatedEntry) {
    throw createEntryNotFoundError();
  }

  return { entry: updatedEntry };
}

async function findEntryById(
  entryId: string,
  dependencies: ReplaceEntrySourcesHandlerDependencies
): Promise<Entry | undefined> {
  return withPersistenceErrorMapping(() =>
    dependencies.entryRepository.findById(entryId)
  );
}

async function touchEntry(
  entryId: string,
  dependencies: ReplaceEntrySourcesHandlerDependencies
): Promise<Entry | undefined> {
  const updatedAt = (dependencies.now ?? (() => new Date()))().toISOString();

  return withPersistenceErrorMapping(() =>
    dependencies.entryRepository.update(entryId, {}, updatedAt)
  );
}
