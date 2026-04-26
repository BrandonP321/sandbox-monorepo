import {
  createRoute,
  createRouter,
  type RouteHandler
} from "@repo/api-core";
import {
  signalTrackerRouteEntries,
  type SignalTrackerRouteName
} from "@repo/signal-tracker-shared";

import { getHealth } from "../routes/health/get-health";
import { createTopic } from "../routes/topics/create-topic";

const routeHandlers = {
  createTopic,
  getHealth
} satisfies Record<SignalTrackerRouteName, RouteHandler>;

export const appRouter = createRouter(
  signalTrackerRouteEntries.map(([routeName, route]) =>
    createRoute(route, routeHandlers[routeName])
  )
);
