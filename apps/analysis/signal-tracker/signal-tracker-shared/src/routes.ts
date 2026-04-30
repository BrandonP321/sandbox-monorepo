import { z } from "zod";

type SignalTrackerRouteSpec = {
  method: "POST";
  path: `/${string}`;
};

export const signalTrackerRoutes = {
  createTopic: {
    method: "POST",
    path: "/create-topic"
  },
  getTopic: {
    method: "POST",
    path: "/get-topic"
  },
  listTopics: {
    method: "POST",
    path: "/list-topics"
  },
  updateTopic: {
    method: "POST",
    path: "/update-topic"
  },
  archiveTopic: {
    method: "POST",
    path: "/archive-topic"
  },
  deleteTopic: {
    method: "POST",
    path: "/delete-topic"
  },
  createEventEntry: {
    method: "POST",
    path: "/create-event-entry"
  },
  createAssessmentUpdate: {
    method: "POST",
    path: "/create-assessment-update"
  },
  getEventEntry: {
    method: "POST",
    path: "/get-event-entry"
  },
  listEventEntries: {
    method: "POST",
    path: "/list-event-entries"
  },
  updateEventEntry: {
    method: "POST",
    path: "/update-event-entry"
  },
  getHealth: {
    method: "POST",
    path: "/get-health"
  }
} as const satisfies Record<string, SignalTrackerRouteSpec>;

export type SignalTrackerRouteName = keyof typeof signalTrackerRoutes;
export type SignalTrackerRoute =
  (typeof signalTrackerRoutes)[SignalTrackerRouteName];

export const signalTrackerRouteEntries = Object.entries(
  signalTrackerRoutes
) as Array<[SignalTrackerRouteName, SignalTrackerRoute]>;

export const signalTrackerRouteList = signalTrackerRouteEntries.map(
  ([, route]) => route
);

export const signalTrackerHealthResponseSchema = z.object({
  ok: z.boolean()
});

export type SignalTrackerHealthResponse = z.infer<
  typeof signalTrackerHealthResponseSchema
>;
