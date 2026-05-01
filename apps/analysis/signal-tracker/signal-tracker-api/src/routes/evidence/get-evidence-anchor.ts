import {
  signalTrackerRouteContracts,
  type GetEvidenceAnchorResponse
} from "@repo/signal-tracker-shared";
import type { RouteHandler } from "@repo/api-core";

import { createEvidenceAnchorNotFoundError } from "../../app/errors";
import {
  createJsonRouteHandler,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import type { EvidenceAnchorRepository } from "../../domain/evidence/evidence-anchor-repository";

type GetEvidenceAnchorHandlerDependencies = {
  evidenceAnchorRepository: Pick<EvidenceAnchorRepository, "findById">;
};

export function createGetEvidenceAnchorHandler(
  dependencies: GetEvidenceAnchorHandlerDependencies
): RouteHandler {
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.getEvidenceAnchor,
    handle: async (request) =>
      findEvidenceAnchor(request.anchorId, dependencies)
  });
}

async function findEvidenceAnchor(
  anchorId: string,
  dependencies: GetEvidenceAnchorHandlerDependencies
): Promise<GetEvidenceAnchorResponse> {
  const anchor = await withPersistenceErrorMapping(() =>
    dependencies.evidenceAnchorRepository.findById(anchorId)
  );

  if (!anchor) {
    throw createEvidenceAnchorNotFoundError();
  }

  return { anchor };
}
