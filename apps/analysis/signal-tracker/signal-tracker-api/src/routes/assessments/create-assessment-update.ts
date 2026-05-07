import {
  signalTrackerRouteContracts,
  type AssessmentUpdate,
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
import type { SignalTrackerApiDependencies } from "../../app/dependencies";
import type { EntryCitationRepository } from "../../domain/citations/entry-citation-repository";
import { replaceEntrySourceAttachments } from "../../domain/entries/entry-source-attachments";
import type { EvidenceRepository } from "../../domain/evidence/evidence-repository";

type CreateAssessmentUpdateHandlerDependencies =
  CreateAssessmentUpdateDependencies & {
    evidenceRepository?: Pick<EvidenceRepository, "create">;
    entryCitationRepository?: Pick<
      EntryCitationRepository,
      "createOrFind" | "listByEntry" | "deleteForEntry"
    >;
    runInTransaction?: SignalTrackerApiDependencies["runInTransaction"];
  };

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
): Promise<AssessmentUpdate> {
  return withPersistenceErrorMapping(
    () => runAssessmentUpdateWrite(input, dependencies),
    {
      mapDomainError: (error) =>
        error instanceof EntryTopicNotFoundError
          ? createTopicNotFoundError()
          : undefined
    }
  );
}

async function runAssessmentUpdateWrite(
  input: CreateAssessmentUpdateRequest,
  dependencies: CreateAssessmentUpdateHandlerDependencies
): Promise<AssessmentUpdate> {
  if (dependencies.runInTransaction) {
    return await dependencies.runInTransaction((transactionDependencies) =>
      persistAssessmentUpdateWithDependencies(input, {
        ...transactionDependencies,
        generateId: dependencies.generateId,
        now: dependencies.now
      })
    );
  }

  return await persistAssessmentUpdateWithDependencies(input, dependencies);
}

async function persistAssessmentUpdateWithDependencies(
  input: CreateAssessmentUpdateRequest,
  dependencies: CreateAssessmentUpdateHandlerDependencies
): Promise<AssessmentUpdate> {
  const { sources, ...assessmentInput } = input;
  const assessmentUpdate = await createAssessmentUpdateRecord(
    assessmentInput,
    dependencies
  );

  if (sources !== undefined) {
    await replaceEntrySourceAttachments(
      assessmentUpdate.entry.id,
      sources,
      getSourceAttachmentDependencies(dependencies)
    );
  }

  return assessmentUpdate;
}

function getSourceAttachmentDependencies(
  dependencies: CreateAssessmentUpdateHandlerDependencies
) {
  if (
    !dependencies.evidenceRepository ||
    !dependencies.entryCitationRepository
  ) {
    throw new Error("Source attachment dependencies are not configured");
  }

  return {
    evidenceRepository: dependencies.evidenceRepository,
    entryCitationRepository: dependencies.entryCitationRepository,
    generateId: dependencies.generateId,
    now: dependencies.now
  };
}
