import {
  signalTrackerRouteContracts,
  type CaptureEvidenceUrlRequest
} from "@repo/signal-tracker-shared";
import type { RouteHandler } from "@repo/api-core";

import {
  createJsonRouteHandler,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import { captureEvidenceUrlRecord } from "../../domain/evidence/capture-evidence-url";
import type { EvidenceRepository } from "../../domain/evidence/evidence-repository";

type CaptureEvidenceUrlHandlerDependencies = {
  evidenceRepository: EvidenceRepository;
  generateId?: () => string;
  now?: () => Date;
};

export function createCaptureEvidenceUrlHandler(
  dependencies: CaptureEvidenceUrlHandlerDependencies
): RouteHandler {
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.captureEvidenceUrl,
    handle: async (request) => persistCapturedEvidenceUrl(request, dependencies)
  });
}

async function persistCapturedEvidenceUrl(
  input: CaptureEvidenceUrlRequest,
  dependencies: CaptureEvidenceUrlHandlerDependencies
) {
  return withPersistenceErrorMapping(() =>
    captureEvidenceUrlRecord(input, {
      repository: dependencies.evidenceRepository,
      generateId: dependencies.generateId,
      now: dependencies.now
    })
  );
}
