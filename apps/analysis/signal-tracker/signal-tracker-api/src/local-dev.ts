import { startLocalDevServer } from "@repo/api-core";

import { appRouter } from "./app/router";
import { loadSignalTrackerLocalEnv } from "./local-env";

loadSignalTrackerLocalEnv();

startLocalDevServer(appRouter, { appName: "Signal Tracker API" });
