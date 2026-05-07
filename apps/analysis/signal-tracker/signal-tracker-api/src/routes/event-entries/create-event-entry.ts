import {
  signalTrackerRouteContracts,
  type Entry,
  type CreateEventEntryRequest
} from "@repo/signal-tracker-shared";
import type { RouteHandler } from "@repo/api-core";

import { createTopicNotFoundError } from "../../app/errors";
import {
  createJsonRouteHandler,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import {
  createEntryRecord,
  EntryTopicNotFoundError
} from "../../domain/entries/create-entry";
import type { EntryRepository } from "../../domain/entries/entry-repository";
import { replaceEntrySourceAttachments } from "../../domain/entries/entry-source-attachments";
import type { EntryCitationRepository } from "../../domain/citations/entry-citation-repository";
import type { EvidenceRepository } from "../../domain/evidence/evidence-repository";
import type { TopicRepository } from "../../domain/topics/topic-repository";
import type { SignalTrackerApiDependencies } from "../../app/dependencies";

type CreateEventEntryHandlerDependencies = {
  entryRepository: EntryRepository;
  topicRepository: Pick<TopicRepository, "findById">;
  evidenceRepository?: Pick<EvidenceRepository, "create">;
  entryCitationRepository?: Pick<
    EntryCitationRepository,
    "createOrFind" | "listByEntry" | "deleteForEntry"
  >;
  generateId?: () => string;
  now?: () => Date;
  runInTransaction?: SignalTrackerApiDependencies["runInTransaction"];
};

export function createCreateEventEntryHandler(
  dependencies: CreateEventEntryHandlerDependencies
): RouteHandler {
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.createEventEntry,
    handle: async (request) => {
      const entry = await persistEventEntry(request, dependencies);

      return { entry };
    }
  });
}

async function persistEventEntry(
  input: CreateEventEntryRequest,
  dependencies: CreateEventEntryHandlerDependencies
): Promise<Entry> {
  return withPersistenceErrorMapping(
    () => runEventEntryWrite(input, dependencies),
    {
      mapDomainError: (error) =>
        error instanceof EntryTopicNotFoundError
          ? createTopicNotFoundError()
          : undefined
    }
  );
}

async function runEventEntryWrite(
  input: CreateEventEntryRequest,
  dependencies: CreateEventEntryHandlerDependencies
): Promise<Entry> {
  if (dependencies.runInTransaction) {
    return await dependencies.runInTransaction((transactionDependencies) =>
      persistEventEntryWithDependencies(input, {
        ...transactionDependencies,
        generateId: dependencies.generateId,
        now: dependencies.now
      })
    );
  }

  return await persistEventEntryWithDependencies(input, dependencies);
}

async function persistEventEntryWithDependencies(
  input: CreateEventEntryRequest,
  dependencies: CreateEventEntryHandlerDependencies
): Promise<Entry> {
  const { sources, ...entryInput } = input;
  const entry = await createEntryRecord(
    {
      ...entryInput,
      kind: "event",
      originType: "manual",
      isApproximateDate: false
    },
    dependencies
  );

  if (sources !== undefined) {
    await replaceEntrySourceAttachments(
      entry.id,
      sources,
      getSourceAttachmentDependencies(dependencies)
    );
  }

  return entry;
}

function getSourceAttachmentDependencies(
  dependencies: CreateEventEntryHandlerDependencies
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
