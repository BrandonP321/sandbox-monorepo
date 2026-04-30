import {
  AppError,
  responses,
  type ApiRequest,
  type RouteHandler
} from "@repo/api-core";
import {
  listEventEntriesRequestSchema,
  listEventEntriesResponseSchema,
  type Entry
} from "@repo/signal-tracker-shared";

import { createPersistenceUnavailableError } from "../../app/errors";
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
    const payload = parseJsonBody(request.body);
    const parsedRequest = listEventEntriesRequestSchema.safeParse(payload);

    if (!parsedRequest.success) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Event entry list request is invalid",
        400
      );
    }

    const entries = await listActiveEventEntries(
      parsedRequest.data.topicId,
      dependencies
    );
    const response = listEventEntriesResponseSchema.parse({ entries });

    return responses.ok(response);
  };
}

export const listEventEntries = createListEventEntriesHandler();

async function listActiveEventEntries(
  topicId: string,
  dependencies: ListEventEntriesHandlerDependencies
): Promise<Entry[]> {
  try {
    const entries = await dependencies.entryRepository.listByTopic(topicId);

    return entries.filter((entry) => entry.kind === "event");
  } catch {
    throw createPersistenceUnavailableError();
  }
}

function parseJsonBody(body: string | null | undefined): unknown {
  if (!body) {
    return {};
  }

  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new AppError(
      "VALIDATION_ERROR",
      "Request body must be valid JSON",
      400
    );
  }
}
