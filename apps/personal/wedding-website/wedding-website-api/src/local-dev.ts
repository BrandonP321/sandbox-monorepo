import { startLocalDevServer } from "@repo/api-core";

import {
  createAdminRsvpApiDependencies,
  sha256Hex
} from "./admin/dependencies.js";
import { createAdminRsvpAppRouter } from "./admin/router.js";
import { appRouter } from "./app/router.js";

const LOCAL_ADMIN_ACCESS_KEY = "local-admin";
const localAdminRouter = createAdminRsvpAppRouter(
  createAdminRsvpApiDependencies({
    accessKeySha256: sha256Hex(LOCAL_ADMIN_ACCESS_KEY)
  })
);

startLocalDevServer(
  (request) =>
    request.path === "/admin/rsvps"
      ? localAdminRouter(request)
      : appRouter(request),
  {
    appName: "Wedding Website API",
    cors: {
      allowedHeaders: ["content-type", "idempotency-key", "authorization"],
      allowedMethods: ["GET", "POST", "OPTIONS"]
    }
  }
);
