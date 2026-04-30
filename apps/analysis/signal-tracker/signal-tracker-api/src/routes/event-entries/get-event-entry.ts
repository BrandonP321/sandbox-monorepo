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
import type { EntryRepository } from "../../domain/entries/entry-repository";

type GetEventEntryHandlerDependencies = {
  entryRepository: Pick<EntryRepository, "findById">;
};

export function createGetEventEntryHandler(
  dependencies: GetEventEntryHandlerDependencies
): RouteHandler {
  return async (request: ApiRequest) => {
    const parsedRequest = parseRequestBody(
      getEventEntryRequestSchema,
      request.body
    );

    const entry = await findEventEntry(parsedRequest.entryId, dependencies);

    return okResponse(getEventEntryResponseSchema, { entry });
  };
}

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
