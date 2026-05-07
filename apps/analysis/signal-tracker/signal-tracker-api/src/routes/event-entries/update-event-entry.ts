import {
  signalTrackerRouteContracts,
  type Entry,
  type UpdateEventEntryRequest
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
import type { SignalTrackerApiDependencies } from "../../app/dependencies";
import type { EntryCitationRepository } from "../../domain/citations/entry-citation-repository";
import { replaceEntrySourceAttachments } from "../../domain/entries/entry-source-attachments";
import type { EvidenceRepository } from "../../domain/evidence/evidence-repository";

type UpdateEventEntryHandlerDependencies = {
  entryRepository: Pick<EntryRepository, "findById" | "update">;
  evidenceRepository?: Pick<EvidenceRepository, "create">;
  entryCitationRepository?: Pick<
    EntryCitationRepository,
    "createOrFind" | "listByEntry" | "deleteForEntry"
  >;
  generateId?: () => string;
  now?: () => Date;
  runInTransaction?: SignalTrackerApiDependencies["runInTransaction"];
};

export function createUpdateEventEntryHandler(
  dependencies: UpdateEventEntryHandlerDependencies
): RouteHandler {
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.updateEventEntry,
    handle: async (request) => {
      const entry = await withPersistenceErrorMapping(() =>
        updateEventEntryRecord(request, dependencies)
      );

      return { entry };
    }
  });
}

async function updateEventEntryRecord(
  input: UpdateEventEntryRequest,
  dependencies: UpdateEventEntryHandlerDependencies
): Promise<Entry> {
  if (dependencies.runInTransaction) {
    return await dependencies.runInTransaction((transactionDependencies) =>
      updateEventEntryRecordWithDependencies(input, {
        ...transactionDependencies,
        generateId: dependencies.generateId,
        now: dependencies.now
      })
    );
  }

  return await updateEventEntryRecordWithDependencies(input, dependencies);
}

async function updateEventEntryRecordWithDependencies(
  input: UpdateEventEntryRequest,
  dependencies: UpdateEventEntryHandlerDependencies
): Promise<Entry> {
  const { entryId, sources, ...updates } = input;
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

  if (sources !== undefined) {
    await replaceEntrySourceAttachments(
      entryId,
      sources,
      getSourceAttachmentDependencies(dependencies)
    );
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

function getSourceAttachmentDependencies(
  dependencies: UpdateEventEntryHandlerDependencies
) {
  if (
    !dependencies.evidenceRepository ||
    !dependencies.entryCitationRepository
  ) {
    throw new Error("Source attachment dependencies are not configured");
  }

  return {
    evidenceRepository: dependencies.evidenceRepository,
    entryCitationRepository: dependencies.entryCitationRepository,
    generateId: dependencies.generateId,
    now: dependencies.now
  };
}
