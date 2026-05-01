import {
  signalTrackerRouteContracts,
  type ListEvidenceAnchorsForItemResponse
} from "@repo/signal-tracker-shared";
import type { RouteHandler } from "@repo/api-core";

import { createEvidenceItemNotFoundError } from "../../app/errors";
import {
  createJsonRouteHandler,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import type { EvidenceAnchorRepository } from "../../domain/evidence/evidence-anchor-repository";
import type { EvidenceRepository } from "../../domain/evidence/evidence-repository";

type ListEvidenceAnchorsForItemHandlerDependencies = {
  evidenceAnchorRepository: Pick<
    EvidenceAnchorRepository,
    "listByEvidenceItemId"
  >;
  evidenceRepository: Pick<EvidenceRepository, "findById">;
};

export function createListEvidenceAnchorsForItemHandler(
  dependencies: ListEvidenceAnchorsForItemHandlerDependencies
): RouteHandler {
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.listEvidenceAnchorsForItem,
    handle: async (request) =>
      listEvidenceAnchorsForItem(request.evidenceItemId, dependencies)
  });
}

async function listEvidenceAnchorsForItem(
  evidenceItemId: string,
  dependencies: ListEvidenceAnchorsForItemHandlerDependencies
): Promise<ListEvidenceAnchorsForItemResponse> {
  return await withPersistenceErrorMapping(async () => {
    const evidenceRecord =
      await dependencies.evidenceRepository.findById(evidenceItemId);

    if (!evidenceRecord) {
      throw createEvidenceItemNotFoundError();
    }

    return {
      anchors:
        await dependencies.evidenceAnchorRepository.listByEvidenceItemId(
          evidenceItemId
        )
    };
  });
}
