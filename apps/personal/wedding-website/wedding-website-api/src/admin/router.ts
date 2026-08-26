import {
  weddingWebsiteApiErrorCodes,
  weddingWebsiteRouteContracts
} from "@repo/wedding-website-shared";
import { createRoute, createRouter } from "@repo/api-core";

import {
  createAdminRsvpApiDependencies,
  type AdminRsvpApiDependencies
} from "./dependencies.js";
import { createListAdminRsvpsHandler } from "./list-admin-rsvps.js";

export function createAdminRsvpAppRouter(
  dependencies: AdminRsvpApiDependencies = createAdminRsvpApiDependencies()
) {
  return createRouter(
    [
      createRoute(
        weddingWebsiteRouteContracts.listAdminRsvps.route,
        createListAdminRsvpsHandler(dependencies)
      )
    ],
    dependencies.logger,
    {
      formatUnexpectedErrorLogEntry: ({ requestId, route }) => ({
        level: "error",
        event: "admin_unhandled_error",
        category: weddingWebsiteApiErrorCodes.internalError,
        requestId,
        route
      })
    }
  );
}
