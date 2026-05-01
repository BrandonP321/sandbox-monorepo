import {
  signalTrackerRouteContracts,
  type CreateEvidenceItemRequest
} from "@repo/signal-tracker-shared";
import type { RouteHandler } from "@repo/api-core";

import {
  createJsonRouteHandler,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import { createEvidenceItemRecord } from "../../domain/evidence/create-evidence-item";
import type { EvidenceRepository } from "../../domain/evidence/evidence-repository";

type CreateEvidenceItemHandlerDependencies = {
  evidenceRepository: EvidenceRepository;
  generateId?: () => string;
  now?: () => Date;
};

export function createCreateEvidenceItemHandler(
  dependencies: CreateEvidenceItemHandlerDependencies
): RouteHandler {
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.createEvidenceItem,
    handle: async (request) => persistEvidenceItem(request, dependencies)
  });
}

async function persistEvidenceItem(
  input: CreateEvidenceItemRequest,
  dependencies: CreateEvidenceItemHandlerDependencies
) {
  return withPersistenceErrorMapping(() =>
    createEvidenceItemRecord(input, {
      repository: dependencies.evidenceRepository,
      generateId: dependencies.generateId,
      now: dependencies.now
    })
  );
}
