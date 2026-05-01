import { signalTrackerRouteContracts } from "@repo/signal-tracker-shared";
import type { EvidenceRecord } from "@repo/signal-tracker-shared";
import type { RouteHandler } from "@repo/api-core";

import { createEvidenceItemNotFoundError } from "../../app/errors";
import {
  createJsonRouteHandler,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import type { EvidenceRepository } from "../../domain/evidence/evidence-repository";

type GetEvidenceItemHandlerDependencies = {
  evidenceRepository: Pick<EvidenceRepository, "findById">;
};

export function createGetEvidenceItemHandler(
  dependencies: GetEvidenceItemHandlerDependencies
): RouteHandler {
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.getEvidenceItem,
    handle: async (request) =>
      findEvidenceItem(request.evidenceItemId, dependencies)
  });
}

async function findEvidenceItem(
  evidenceItemId: string,
  dependencies: GetEvidenceItemHandlerDependencies
): Promise<EvidenceRecord> {
  const record = await withPersistenceErrorMapping(() =>
    dependencies.evidenceRepository.findById(evidenceItemId)
  );

  if (!record) {
    throw createEvidenceItemNotFoundError();
  }

  return record;
}
