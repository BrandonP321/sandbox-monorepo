import {
  signalTrackerHealthResponseSchema,
  signalTrackerRoutes,
  type SignalTrackerHealthResponse
} from "@repo/signal-tracker-shared";

import { loadRuntimeConfig } from "./config";

export async function fetchHealthStatus(): Promise<SignalTrackerHealthResponse> {
  const config = await loadRuntimeConfig();
  const response = await fetch(
    `${config.apiBaseUrl}${signalTrackerRoutes.getHealth.path}`,
    {
      method: signalTrackerRoutes.getHealth.method,
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({})
    }
  );

  if (!response.ok) {
    throw new Error("Unable to reach the Signal Tracker API.");
  }

  return signalTrackerHealthResponseSchema.parse(await response.json());
}
