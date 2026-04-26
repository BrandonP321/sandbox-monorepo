import { definePostmanProject } from "@repo/postman-sync";
import { signalTrackerRoutes } from "@repo/signal-tracker-shared";

export default definePostmanProject({
  projectSlug: "signal-tracker",
  displayName: "Signal Tracker",
  apiPackageName: "signal-tracker-api",
  postman: {
    workspaceName: "Signal Tracker",
    collectionName: "Signal Tracker API"
  },
  routes: signalTrackerRoutes,
  requestConfigGlobs: ["signal-tracker-api/src/routes/**/*.postman-config.ts"],
  environments: {
    local: {
      name: "Signal Tracker - Local",
      values: {
        baseUrl: {
          value: "http://localhost:3001",
          type: "default"
        }
      }
    },
    dev: {
      name: "Signal Tracker - Dev",
      values: {
        authToken: {
          value: "",
          type: "secret"
        },
        baseUrl: {
          value: "{{SIGNAL_TRACKER_DEV_API_URL}}",
          type: "default"
        }
      }
    },
    prod: {
      name: "Signal Tracker - Prod",
      values: {
        authToken: {
          value: "",
          type: "secret"
        },
        baseUrl: {
          value: "{{SIGNAL_TRACKER_PROD_API_URL}}",
          type: "default"
        }
      }
    }
  }
});
