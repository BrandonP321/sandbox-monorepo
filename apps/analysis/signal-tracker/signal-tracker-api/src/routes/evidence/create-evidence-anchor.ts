import {
  signalTrackerRouteContracts,
  type CreateEvidenceAnchorRequest,
  type CreateEvidenceAnchorResponse
} from "@repo/signal-tracker-shared";
import type { RouteHandler } from "@repo/api-core";

import { createEvidenceItemNotFoundError } from "../../app/errors";
import {
  createJsonRouteHandler,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import {
  createEvidenceAnchorRecord,
  EvidenceItemMissingForAnchorError
} from "../../domain/evidence/create-evidence-anchor";
import type { EvidenceAnchorRepository } from "../../domain/evidence/evidence-anchor-repository";
import type { EvidenceRepository } from "../../domain/evidence/evidence-repository";

type CreateEvidenceAnchorHandlerDependencies = {
  evidenceAnchorRepository: EvidenceAnchorRepository;
  evidenceRepository: Pick<EvidenceRepository, "findById">;
  generateId?: () => string;
  now?: () => Date;
};

export function createCreateEvidenceAnchorHandler(
  dependencies: CreateEvidenceAnchorHandlerDependencies
): RouteHandler {
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.createEvidenceAnchor,
    handle: async (request) => persistEvidenceAnchor(request, dependencies)
  });
}

async function persistEvidenceAnchor(
  input: CreateEvidenceAnchorRequest,
  dependencies: CreateEvidenceAnchorHandlerDependencies
): Promise<CreateEvidenceAnchorResponse> {
  const anchor = await withPersistenceErrorMapping(
    () =>
      createEvidenceAnchorRecord(input, {
        repository: dependencies.evidenceAnchorRepository,
        evidenceRepository: dependencies.evidenceRepository,
        generateId: dependencies.generateId,
        now: dependencies.now
      }),
    {
      mapDomainError: (error) =>
        error instanceof EvidenceItemMissingForAnchorError
          ? createEvidenceItemNotFoundError()
          : undefined
    }
  );

  return { anchor };
}
