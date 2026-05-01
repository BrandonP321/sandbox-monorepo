import {
  signalTrackerRouteContracts,
  type ListEvidenceItemsResponse
} from "@repo/signal-tracker-shared";
import type { RouteHandler } from "@repo/api-core";

import {
  createJsonRouteHandler,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import type {
  EvidenceRepository,
  ListEvidenceOptions
} from "../../domain/evidence/evidence-repository";

type ListEvidenceItemsHandlerDependencies = {
  evidenceRepository: Pick<EvidenceRepository, "list">;
};

export function createListEvidenceItemsHandler(
  dependencies: ListEvidenceItemsHandlerDependencies
): RouteHandler {
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.listEvidenceItems,
    handle: async (request) => listEvidenceItems(request, dependencies)
  });
}

async function listEvidenceItems(
  request: ListEvidenceOptions,
  dependencies: ListEvidenceItemsHandlerDependencies
): Promise<ListEvidenceItemsResponse> {
  const evidence = await withPersistenceErrorMapping(() =>
    dependencies.evidenceRepository.list(request)
  );

  return { evidence };
}
