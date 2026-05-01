import {
  signalTrackerRouteContracts,
  type DetachEntryCitationResponse
} from "@repo/signal-tracker-shared";
import type { RouteHandler } from "@repo/api-core";

import { createEntryCitationNotFoundError } from "../../app/errors";
import {
  createJsonRouteHandler,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import {
  detachEntryCitation,
  EntryCitationMissingError
} from "../../domain/citations/manage-entry-citations";
import type { EntryCitationRepository } from "../../domain/citations/entry-citation-repository";
import type { EntryRepository } from "../../domain/entries/entry-repository";
import type { EvidenceAnchorRepository } from "../../domain/evidence/evidence-anchor-repository";
import type { EvidenceRepository } from "../../domain/evidence/evidence-repository";
import { mapCitationDomainError } from "./attach-entry-citation";

type DetachEntryCitationHandlerDependencies = {
  entryCitationRepository: EntryCitationRepository;
  entryRepository: Pick<EntryRepository, "findById">;
  evidenceRepository: Pick<EvidenceRepository, "findById">;
  evidenceAnchorRepository: Pick<EvidenceAnchorRepository, "findById">;
};

export function createDetachEntryCitationHandler(
  dependencies: DetachEntryCitationHandlerDependencies
): RouteHandler {
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.detachEntryCitation,
    handle: async (request) =>
      detachCitation(request.entryId, request.citationId, dependencies)
  });
}

async function detachCitation(
  entryId: string,
  citationId: string,
  dependencies: DetachEntryCitationHandlerDependencies
): Promise<DetachEntryCitationResponse> {
  const citation = await withPersistenceErrorMapping(
    () => detachEntryCitation(entryId, citationId, dependencies),
    {
      mapDomainError: (error) => {
        if (error instanceof EntryCitationMissingError) {
          return createEntryCitationNotFoundError();
        }

        return mapCitationDomainError(error);
      }
    }
  );

  return { citation };
}
