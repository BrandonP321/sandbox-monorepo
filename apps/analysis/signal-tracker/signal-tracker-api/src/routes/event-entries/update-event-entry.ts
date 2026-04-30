import {
  AppError,
  responses,
  type ApiRequest,
  type RouteHandler
} from "@repo/api-core";
import {
  updateEventEntryRequestSchema,
  updateEventEntryResponseSchema,
  type Entry
} from "@repo/signal-tracker-shared";

import { createPersistenceUnavailableError } from "../../app/errors";
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
    const payload = parseJsonBody(request.body);
    const parsedRequest = updateEventEntryRequestSchema.safeParse(payload);

    if (!parsedRequest.success) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Event entry update request is invalid",
        400
      );
    }

    const { entryId, ...updates } = parsedRequest.data;
    const entry = await updateEventEntryRecord(entryId, updates, dependencies);
    const response = updateEventEntryResponseSchema.parse({ entry });

    return responses.ok(response);
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
  try {
    return await dependencies.entryRepository.findById(entryId);
  } catch {
    throw createPersistenceUnavailableError();
  }
}

async function persistEntryUpdate(
  entryId: string,
  updates: UpdateEntryFields,
  updatedAt: string,
  dependencies: UpdateEventEntryHandlerDependencies
): Promise<Entry | undefined> {
  try {
    return await dependencies.entryRepository.update(
      entryId,
      updates,
      updatedAt
    );
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
