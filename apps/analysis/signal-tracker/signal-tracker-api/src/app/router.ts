import { createRoute, createRouter, type RouteHandler } from "@repo/api-core";
import {
  signalTrackerRouteEntries,
  type SignalTrackerRouteName
} from "@repo/signal-tracker-shared";

import { createEventEntry } from "../routes/event-entries/create-event-entry";
import { getEventEntry } from "../routes/event-entries/get-event-entry";
import { updateEventEntry } from "../routes/event-entries/update-event-entry";
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
  createEventEntry,
  getEventEntry,
  updateEventEntry,
  getHealth
} satisfies Record<SignalTrackerRouteName, RouteHandler>;

export const appRouter = createRouter(
  signalTrackerRouteEntries.map(([routeName, route]) =>
    createRoute(route, routeHandlers[routeName])
  )
);
