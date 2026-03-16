import { startLocalDevServer } from "@repo/api-core";

import { appRouter } from "./app/router";

startLocalDevServer(appRouter, { appName: "Hello World API" });
