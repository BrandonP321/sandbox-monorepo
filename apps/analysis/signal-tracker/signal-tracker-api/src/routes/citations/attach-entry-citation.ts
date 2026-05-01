import {
  signalTrackerRouteContracts,
  type AttachEntryCitationRequest,
  type AttachEntryCitationResponse
} from "@repo/signal-tracker-shared";
import type { RouteHandler } from "@repo/api-core";

import {
  createEntryNotFoundError,
  createEvidenceAnchorNotFoundError,
  createEvidenceItemNotFoundError
} from "../../app/errors";
import {
  createJsonRouteHandler,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import {
  attachEntryCitation,
  EntryMissingForCitationError,
  EvidenceAnchorMissingForCitationError,
  EvidenceItemMissingForCitationError
} from "../../domain/citations/manage-entry-citations";
import type { EntryCitationRepository } from "../../domain/citations/entry-citation-repository";
import type { EntryRepository } from "../../domain/entries/entry-repository";
import type { EvidenceAnchorRepository } from "../../domain/evidence/evidence-anchor-repository";
import type { EvidenceRepository } from "../../domain/evidence/evidence-repository";

type AttachEntryCitationHandlerDependencies = {
  entryCitationRepository: EntryCitationRepository;
  entryRepository: Pick<EntryRepository, "findById">;
  evidenceRepository: Pick<EvidenceRepository, "findById">;
  evidenceAnchorRepository: Pick<EvidenceAnchorRepository, "findById">;
  generateId?: () => string;
  now?: () => Date;
};

export function createAttachEntryCitationHandler(
  dependencies: AttachEntryCitationHandlerDependencies
): RouteHandler {
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.attachEntryCitation,
    handle: async (request) => attachCitation(request, dependencies)
  });
}

async function attachCitation(
  input: AttachEntryCitationRequest,
  dependencies: AttachEntryCitationHandlerDependencies
): Promise<AttachEntryCitationResponse> {
  const citation = await withPersistenceErrorMapping(
    () => attachEntryCitation(input, dependencies),
    {
      mapDomainError: mapCitationDomainError
    }
  );

  return { citation };
}

export function mapCitationDomainError(error: unknown) {
  if (error instanceof EntryMissingForCitationError) {
    return createEntryNotFoundError();
  }

  if (error instanceof EvidenceItemMissingForCitationError) {
    return createEvidenceItemNotFoundError();
  }

  if (error instanceof EvidenceAnchorMissingForCitationError) {
    return createEvidenceAnchorNotFoundError();
  }

  return undefined;
}
