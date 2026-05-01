import {
  signalTrackerRouteContracts,
  type CreateReviewNoteRequest
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

type CreateReviewNoteHandlerDependencies = {
  entryRepository: EntryRepository;
  topicRepository: Pick<TopicRepository, "findById">;
  generateId?: () => string;
  now?: () => Date;
};

export function createCreateReviewNoteHandler(
  dependencies: CreateReviewNoteHandlerDependencies
): RouteHandler {
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.createReviewNote,
    handle: async (request) => {
      const entry = await persistReviewNote(request, dependencies);

      return { entry };
    }
  });
}

async function persistReviewNote(
  input: CreateReviewNoteRequest,
  dependencies: CreateReviewNoteHandlerDependencies
) {
  return withPersistenceErrorMapping(
    () =>
      createEntryRecord(
        {
          ...input,
          kind: "review",
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
