import { signalTrackerRouteContracts } from "@repo/signal-tracker-shared";

import { createJsonRouteHandler } from "../../app/route-helpers";

export const getHealth = createJsonRouteHandler({
  contract: signalTrackerRouteContracts.getHealth,
  handle: () => ({ ok: true })
});
