import { createRoute, createRouter, type RouteHandler } from "@repo/api-core";
import {
  signalTrackerRouteEntries,
  type SignalTrackerRouteName
} from "@repo/signal-tracker-shared";

import { getHealth } from "../routes/health/get-health";
import { archiveTopic } from "../routes/topics/archive-topic";
import { createTopic } from "../routes/topics/create-topic";
import { deleteTopic } from "../routes/topics/delete-topic";
import { getTopic } from "../routes/topics/get-topic";
import { listTopics } from "../routes/topics/list-topics";
import { updateTopic } from "../routes/topics/update-topic";

const routeHandlers = {
  createTopic,
  getTopic,
  listTopics,
  updateTopic,
  archiveTopic,
  deleteTopic,
  getHealth
} satisfies Record<SignalTrackerRouteName, RouteHandler>;

export const appRouter = createRouter(
  signalTrackerRouteEntries.map(([routeName, route]) =>
    createRoute(route, routeHandlers[routeName])
  )
);
