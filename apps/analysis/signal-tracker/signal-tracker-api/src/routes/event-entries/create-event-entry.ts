import {
  signalTrackerRouteContracts,
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
import type { TopicRepository } from "../../domain/topics/topic-repository";

type CreateEventEntryHandlerDependencies = {
  entryRepository: EntryRepository;
  topicRepository: Pick<TopicRepository, "findById">;
  generateId?: () => string;
  now?: () => Date;
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
) {
  return withPersistenceErrorMapping(
    () =>
      createEntryRecord(
        {
          ...input,
          kind: "event",
          originType: "manual",
          isApproximateDate: false
        },
        dependencies
      ),
    {
      mapDomainError: (error) =>
        error instanceof EntryTopicNotFoundError
          ? createTopicNotFoundError()
          : undefined
    }
  );
}
