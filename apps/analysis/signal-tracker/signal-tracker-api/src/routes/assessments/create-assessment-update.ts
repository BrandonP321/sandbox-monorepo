import {
  AppError,
  responses,
  type ApiRequest,
  type RouteHandler
} from "@repo/api-core";
import {
  createAssessmentUpdateRequestSchema,
  createAssessmentUpdateResponseSchema,
  type CreateAssessmentUpdateRequest
} from "@repo/signal-tracker-shared";

import { createPersistenceUnavailableError } from "../../app/errors";
import { EntryTopicNotFoundError } from "../../domain/entries/create-entry";
import {
  createAssessmentUpdateRecord,
  type CreateAssessmentUpdateDependencies
} from "../../domain/assessments/create-assessment-update";
import { PostgresAssessmentRepository } from "../../domain/assessments/postgres-assessment-repository";
import { PostgresTopicRepository } from "../../domain/topics/postgres-topic-repository";

type CreateAssessmentUpdateHandlerDependencies =
  CreateAssessmentUpdateDependencies;

const defaultAssessmentRepository = new PostgresAssessmentRepository();
const defaultTopicRepository = new PostgresTopicRepository();

export function createCreateAssessmentUpdateHandler(
  dependencies: CreateAssessmentUpdateHandlerDependencies = {
    assessmentRepository: defaultAssessmentRepository,
    topicRepository: defaultTopicRepository
  }
): RouteHandler {
  return async (request: ApiRequest) => {
    const payload = parseJsonBody(request.body);
    const parsedRequest =
      createAssessmentUpdateRequestSchema.safeParse(payload);

    if (!parsedRequest.success) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Assessment update creation request is invalid",
        400
      );
    }

    const assessmentUpdate = await persistAssessmentUpdate(
      parsedRequest.data,
      dependencies
    );
    const response = createAssessmentUpdateResponseSchema.parse({
      assessmentUpdate
    });

    return responses.ok(response);
  };
}

export const createAssessmentUpdate = createCreateAssessmentUpdateHandler();

async function persistAssessmentUpdate(
  input: CreateAssessmentUpdateRequest,
  dependencies: CreateAssessmentUpdateHandlerDependencies
) {
  try {
    return await createAssessmentUpdateRecord(input, dependencies);
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
