import {
  signalTrackerRouteContracts,
  type ListEntryCitationsResponse
} from "@repo/signal-tracker-shared";
import type { RouteHandler } from "@repo/api-core";

import {
  createJsonRouteHandler,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import { listEntryCitations } from "../../domain/citations/manage-entry-citations";
import type { EntryCitationRepository } from "../../domain/citations/entry-citation-repository";
import type { EntryRepository } from "../../domain/entries/entry-repository";
import type { EvidenceAnchorRepository } from "../../domain/evidence/evidence-anchor-repository";
import type { EvidenceRepository } from "../../domain/evidence/evidence-repository";
import { mapCitationDomainError } from "./attach-entry-citation";

type ListEntryCitationsHandlerDependencies = {
  entryCitationRepository: EntryCitationRepository;
  entryRepository: Pick<EntryRepository, "findById">;
  evidenceRepository: Pick<EvidenceRepository, "findById">;
  evidenceAnchorRepository: Pick<EvidenceAnchorRepository, "findById">;
};

export function createListEntryCitationsHandler(
  dependencies: ListEntryCitationsHandlerDependencies
): RouteHandler {
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.listEntryCitations,
    handle: async (request) => listCitations(request.entryId, dependencies)
  });
}

async function listCitations(
  entryId: string,
  dependencies: ListEntryCitationsHandlerDependencies
): Promise<ListEntryCitationsResponse> {
  const citations = await withPersistenceErrorMapping(
    () => listEntryCitations(entryId, dependencies),
    {
      mapDomainError: mapCitationDomainError
    }
  );

  return { citations };
}
