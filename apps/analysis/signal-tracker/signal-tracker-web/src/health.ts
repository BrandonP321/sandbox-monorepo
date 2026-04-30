import type { SignalTrackerHealthResponse } from "@repo/signal-tracker-shared";

import { postSignalTrackerApi } from "./api/client";

export async function fetchHealthStatus(): Promise<SignalTrackerHealthResponse> {
  try {
    return await postSignalTrackerApi({ routeName: "getHealth", body: {} });
  } catch {
    throw new Error("Unable to reach the Signal Tracker API.");
  }
}
