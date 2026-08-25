import { startLocalDevServer } from "@repo/api-core";

import { appRouter } from "./app/router.js";

startLocalDevServer(appRouter, {
  appName: "Wedding Website API",
  cors: { allowedHeaders: ["content-type", "idempotency-key"] }
});
