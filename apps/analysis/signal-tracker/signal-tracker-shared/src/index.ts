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

const trimmedRequiredString = z.string().trim().min(1);
const optionalTrimmedString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value));

export const topicStatusSchema = z.enum(["active"]);
export type TopicStatus = z.infer<typeof topicStatusSchema>;

export const reviewCadenceSchema = z.enum([
  "weekly",
  "biweekly",
  "monthly",
  "ad_hoc"
]);
export type ReviewCadence = z.infer<typeof reviewCadenceSchema>;

export const topicSchema = z.object({
  id: trimmedRequiredString,
  title: trimmedRequiredString,
  framingQuestion: trimmedRequiredString,
  status: topicStatusSchema,
  createdAt: trimmedRequiredString,
  updatedAt: trimmedRequiredString,
  scopeNote: optionalTrimmedString,
  reviewCadence: reviewCadenceSchema
});

export type Topic = z.infer<typeof topicSchema>;

export const createTopicRequestSchema = z.object({
  title: trimmedRequiredString,
  framingQuestion: trimmedRequiredString,
  scopeNote: optionalTrimmedString,
  reviewCadence: reviewCadenceSchema.optional().default("ad_hoc")
});

export type CreateTopicRequest = z.infer<typeof createTopicRequestSchema>;

export const createTopicResponseSchema = z.object({
  topic: topicSchema
});

export type CreateTopicResponse = z.infer<typeof createTopicResponseSchema>;
