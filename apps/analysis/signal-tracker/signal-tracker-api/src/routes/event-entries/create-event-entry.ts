import {
  AppError,
  responses,
  type ApiRequest,
  type RouteHandler
} from "@repo/api-core";
import {
  createEventEntryRequestSchema,
  createEventEntryResponseSchema,
  type CreateEventEntryRequest
} from "@repo/signal-tracker-shared";

import { createPersistenceUnavailableError } from "../../app/errors";
import {
  createEntryRecord,
  EntryTopicNotFoundError
} from "../../domain/entries/create-entry";
import { PostgresEntryRepository } from "../../domain/entries/postgres-entry-repository";
import type { EntryRepository } from "../../domain/entries/entry-repository";
import { PostgresTopicRepository } from "../../domain/topics/postgres-topic-repository";
import type { TopicRepository } from "../../domain/topics/topic-repository";

type CreateEventEntryHandlerDependencies = {
  entryRepository: EntryRepository;
  topicRepository: Pick<TopicRepository, "findById">;
  generateId?: () => string;
  now?: () => Date;
};

const defaultEntryRepository = new PostgresEntryRepository();
const defaultTopicRepository = new PostgresTopicRepository();

export function createCreateEventEntryHandler(
  dependencies: CreateEventEntryHandlerDependencies = {
    entryRepository: defaultEntryRepository,
    topicRepository: defaultTopicRepository
  }
): RouteHandler {
  return async (request: ApiRequest) => {
    const payload = parseJsonBody(request.body);
    const parsedRequest = createEventEntryRequestSchema.safeParse(payload);

    if (!parsedRequest.success) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Event entry creation request is invalid",
        400
      );
    }

    const entry = await persistEventEntry(parsedRequest.data, dependencies);
    const response = createEventEntryResponseSchema.parse({ entry });

    return responses.ok(response);
  };
}

export const createEventEntry = createCreateEventEntryHandler();

async function persistEventEntry(
  input: CreateEventEntryRequest,
  dependencies: CreateEventEntryHandlerDependencies
) {
  try {
    return await createEntryRecord(
      {
        ...input,
        kind: "event",
        originType: "manual",
        isApproximateDate: false
      },
      dependencies
    );
  } catch (error) {
    if (error instanceof EntryTopicNotFoundError) {
      throw new AppError("TOPIC_NOT_FOUND", "Topic not found", 404);
    }

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
