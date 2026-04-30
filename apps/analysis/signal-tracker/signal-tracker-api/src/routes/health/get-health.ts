import { signalTrackerHealthResponseSchema } from "@repo/signal-tracker-shared";

import { okResponse } from "../../app/route-helpers";

export function getHealth() {
  return okResponse(signalTrackerHealthResponseSchema, { ok: true });
}
