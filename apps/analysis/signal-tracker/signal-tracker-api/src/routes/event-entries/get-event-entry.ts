import {
  AppError,
  responses,
  type ApiRequest,
  type RouteHandler
} from "@repo/api-core";
import {
  getEventEntryRequestSchema,
  getEventEntryResponseSchema,
  type Entry
} from "@repo/signal-tracker-shared";

import { createPersistenceUnavailableError } from "../../app/errors";
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
    const payload = parseJsonBody(request.body);
    const parsedRequest = getEventEntryRequestSchema.safeParse(payload);

    if (!parsedRequest.success) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Event entry read request is invalid",
        400
      );
    }

    const entry = await findEventEntry(
      parsedRequest.data.entryId,
      dependencies
    );
    const response = getEventEntryResponseSchema.parse({ entry });

    return responses.ok(response);
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
  try {
    return await dependencies.entryRepository.findById(entryId);
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
