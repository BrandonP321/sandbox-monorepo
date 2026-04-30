import { type ApiRequest, type RouteHandler } from "@repo/api-core";
import {
  listEventEntriesRequestSchema,
  listEventEntriesResponseSchema,
  type Entry
} from "@repo/signal-tracker-shared";

import {
  okResponse,
  parseRequestBody,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import { PostgresEntryRepository } from "../../domain/entries/postgres-entry-repository";
import type { EntryRepository } from "../../domain/entries/entry-repository";

type ListEventEntriesHandlerDependencies = {
  entryRepository: Pick<EntryRepository, "listByTopic">;
};

const defaultEntryRepository = new PostgresEntryRepository();

export function createListEventEntriesHandler(
  dependencies: ListEventEntriesHandlerDependencies = {
    entryRepository: defaultEntryRepository
  }
): RouteHandler {
  return async (request: ApiRequest) => {
    const parsedRequest = parseRequestBody(
      listEventEntriesRequestSchema,
      request.body,
      {
        invalidMessage: "Event entry list request is invalid"
      }
    );

    const entries = await listActiveEventEntries(
      parsedRequest.topicId,
      dependencies
    );

    return okResponse(listEventEntriesResponseSchema, { entries });
  };
}

export const listEventEntries = createListEventEntriesHandler();

async function listActiveEventEntries(
  topicId: string,
  dependencies: ListEventEntriesHandlerDependencies
): Promise<Entry[]> {
  return withPersistenceErrorMapping(async () => {
    const entries = await dependencies.entryRepository.listByTopic(topicId);

    return entries.filter((entry) => entry.kind === "event");
  });
}
