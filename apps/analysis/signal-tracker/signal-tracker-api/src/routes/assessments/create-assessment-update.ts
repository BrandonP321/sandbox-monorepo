import { AppError, type ApiRequest, type RouteHandler } from "@repo/api-core";
import {
  createAssessmentUpdateRequestSchema,
  createAssessmentUpdateResponseSchema,
  type CreateAssessmentUpdateRequest
} from "@repo/signal-tracker-shared";

import {
  okResponse,
  parseRequestBody,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import { EntryTopicNotFoundError } from "../../domain/entries/create-entry";
import {
  createAssessmentUpdateRecord,
  type CreateAssessmentUpdateDependencies
} from "../../domain/assessments/create-assessment-update";

type CreateAssessmentUpdateHandlerDependencies =
  CreateAssessmentUpdateDependencies;

export function createCreateAssessmentUpdateHandler(
  dependencies: CreateAssessmentUpdateHandlerDependencies
): RouteHandler {
  return async (request: ApiRequest) => {
    const parsedRequest = parseRequestBody(
      createAssessmentUpdateRequestSchema,
      request.body
    );

    const assessmentUpdate = await persistAssessmentUpdate(
      parsedRequest,
      dependencies
    );

    return okResponse(createAssessmentUpdateResponseSchema, {
      assessmentUpdate
    });
  };
}

async function persistAssessmentUpdate(
  input: CreateAssessmentUpdateRequest,
  dependencies: CreateAssessmentUpdateHandlerDependencies
) {
  return withPersistenceErrorMapping(
    () => createAssessmentUpdateRecord(input, dependencies),
    {
      mapDomainError: (error) =>
        error instanceof EntryTopicNotFoundError
          ? new AppError("TOPIC_NOT_FOUND", "Topic not found", 404)
          : undefined
    }
  );
}
