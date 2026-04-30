import {
  signalTrackerRouteContracts,
  type CreateAssessmentUpdateRequest
} from "@repo/signal-tracker-shared";
import type { RouteHandler } from "@repo/api-core";

import { createTopicNotFoundError } from "../../app/errors";
import {
  createJsonRouteHandler,
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
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.createAssessmentUpdate,
    handle: async (request) => {
      const assessmentUpdate = await persistAssessmentUpdate(
        request,
        dependencies
      );

      return { assessmentUpdate };
    }
  });
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
          ? createTopicNotFoundError()
          : undefined
    }
  );
}
