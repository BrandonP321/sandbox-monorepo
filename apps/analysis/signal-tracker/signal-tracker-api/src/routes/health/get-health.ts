import { responses } from "@repo/api-core";
import { signalTrackerHealthResponseSchema } from "@repo/signal-tracker-shared";

export function getHealth() {
  const payload = signalTrackerHealthResponseSchema.parse({ ok: true });

  return responses.ok(payload);
}
