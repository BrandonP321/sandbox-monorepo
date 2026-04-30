import { AppError, type ApiRequest, type RouteHandler } from "@repo/api-core";
import {
  updateEventEntryRequestSchema,
  updateEventEntryResponseSchema,
  type Entry
} from "@repo/signal-tracker-shared";

import {
  okResponse,
  parseRequestBody,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import { PostgresEntryRepository } from "../../domain/entries/postgres-entry-repository";
import type {
  EntryRepository,
  UpdateEntryFields
} from "../../domain/entries/entry-repository";

type UpdateEventEntryHandlerDependencies = {
  entryRepository: EntryRepository;
  now?: () => Date;
};

const defaultEntryRepository = new PostgresEntryRepository();

export function createUpdateEventEntryHandler(
  dependencies: UpdateEventEntryHandlerDependencies = {
    entryRepository: defaultEntryRepository
  }
): RouteHandler {
  return async (request: ApiRequest) => {
    const parsedRequest = parseRequestBody(
      updateEventEntryRequestSchema,
      request.body,
      {
        invalidMessage: "Event entry update request is invalid"
      }
    );

    const { entryId, ...updates } = parsedRequest;
    const entry = await updateEventEntryRecord(entryId, updates, dependencies);

    return okResponse(updateEventEntryResponseSchema, { entry });
  };
}

export const updateEventEntry = createUpdateEventEntryHandler();

async function updateEventEntryRecord(
  entryId: string,
  updates: UpdateEntryFields,
  dependencies: UpdateEventEntryHandlerDependencies
): Promise<Entry> {
  const existingEntry = await findEntryById(entryId, dependencies);

  if (!existingEntry || existingEntry.kind !== "event") {
    throw new AppError("EVENT_ENTRY_NOT_FOUND", "Event entry not found", 404);
  }

  const updatedAt = (dependencies.now ?? (() => new Date()))().toISOString();
  const updatedEntry = await persistEntryUpdate(
    entryId,
    updates,
    updatedAt,
    dependencies
  );

  if (!updatedEntry || updatedEntry.kind !== "event") {
    throw new AppError("EVENT_ENTRY_NOT_FOUND", "Event entry not found", 404);
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
