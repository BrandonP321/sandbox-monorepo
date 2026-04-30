import { AppError, type ApiRequest, type RouteHandler } from "@repo/api-core";
import {
  getEventEntryRequestSchema,
  getEventEntryResponseSchema,
  type Entry
} from "@repo/signal-tracker-shared";

import {
  okResponse,
  parseRequestBody,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import { PostgresEntryRepository } from "../../domain/entries/postgres-entry-repository";
import type { EntryRepository } from "../../domain/entries/entry-repository";

type GetEventEntryHandlerDependencies = {
  entryRepository: EntryRepository;
};

const defaultEntryRepository = new PostgresEntryRepository();

export function createGetEventEntryHandler(
  dependencies: GetEventEntryHandlerDependencies = {
    entryRepository: defaultEntryRepository
  }
): RouteHandler {
  return async (request: ApiRequest) => {
    const parsedRequest = parseRequestBody(
      getEventEntryRequestSchema,
      request.body,
      {
        invalidMessage: "Event entry read request is invalid"
      }
    );

    const entry = await findEventEntry(parsedRequest.entryId, dependencies);

    return okResponse(getEventEntryResponseSchema, { entry });
  };
}

export const getEventEntry = createGetEventEntryHandler();

async function findEventEntry(
  entryId: string,
  dependencies: GetEventEntryHandlerDependencies
): Promise<Entry> {
  const entry = await findEntryById(entryId, dependencies);

  if (!entry || entry.kind !== "event") {
    throw new AppError("EVENT_ENTRY_NOT_FOUND", "Event entry not found", 404);
  }

  return entry;
}

async function findEntryById(
  entryId: string,
  dependencies: GetEventEntryHandlerDependencies
): Promise<Entry | undefined> {
  return withPersistenceErrorMapping(() =>
    dependencies.entryRepository.findById(entryId)
  );
}
