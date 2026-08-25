import {
  weddingWebsiteRouteContracts,
  weddingWebsiteApiErrorCodes
} from "@repo/wedding-website-shared";
import { createRoute, createRouter } from "@repo/api-core";

import {
  createWeddingWebsiteApiDependencies,
  type WeddingWebsiteApiDependencies
} from "./dependencies.js";
import { createRsvpSubmissionHandler } from "../routes/create-rsvp-submission.js";

export function createWeddingWebsiteAppRouter(
  dependencies: WeddingWebsiteApiDependencies = createWeddingWebsiteApiDependencies()
) {
  return createRouter(
    [
      createRoute(
        weddingWebsiteRouteContracts.createRsvpSubmission.route,
        createRsvpSubmissionHandler(dependencies)
      )
    ],
    dependencies.logger,
    {
      formatUnexpectedErrorLogEntry: ({ requestId, route }) => ({
        level: "error",
        event: "unhandled_error",
        category: weddingWebsiteApiErrorCodes.internalError,
        requestId,
        route
      })
    }
  );
}

export const appRouter = createWeddingWebsiteAppRouter();
