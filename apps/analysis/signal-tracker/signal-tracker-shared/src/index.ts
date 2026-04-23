import { z } from "zod";

type SignalTrackerRouteSpec = {
  method: "POST";
  path: `/${string}`;
};

export const signalTrackerRoutes = {
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
