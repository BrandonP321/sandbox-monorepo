import { AppError, type ApiRequest, type RouteHandler } from "@repo/api-core";
import {
  createEventEntryRequestSchema,
  createEventEntryResponseSchema,
  type CreateEventEntryRequest
} from "@repo/signal-tracker-shared";

import {
  okResponse,
  parseRequestBody,
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
  return async (request: ApiRequest) => {
    const parsedRequest = parseRequestBody(
      createEventEntryRequestSchema,
      request.body
    );

    const entry = await persistEventEntry(parsedRequest, dependencies);

    return okResponse(createEventEntryResponseSchema, { entry });
  };
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
          ? new AppError("TOPIC_NOT_FOUND", "Topic not found", 404)
          : undefined
    }
  );
}
