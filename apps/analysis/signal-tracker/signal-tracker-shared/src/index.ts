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

export const signalTrackerApiErrorCodes = {
  persistenceUnavailable: "PERSISTENCE_UNAVAILABLE",
  databaseUnavailable: "DATABASE_UNAVAILABLE",
  databaseWaking: "DATABASE_WAKING",
  requestTimeout: "REQUEST_TIMEOUT"
} as const;

export type SignalTrackerApiErrorCode =
  (typeof signalTrackerApiErrorCodes)[keyof typeof signalTrackerApiErrorCodes];

export const signalTrackerRetryableDbErrorCodes = [
  signalTrackerApiErrorCodes.persistenceUnavailable,
  signalTrackerApiErrorCodes.databaseUnavailable,
  signalTrackerApiErrorCodes.databaseWaking,
  signalTrackerApiErrorCodes.requestTimeout
] as const;

export type SignalTrackerRetryableDbErrorCode =
  (typeof signalTrackerRetryableDbErrorCodes)[number];

export function isSignalTrackerRetryableDbErrorCode(
  code: string
): code is SignalTrackerRetryableDbErrorCode {
  return signalTrackerRetryableDbErrorCodes.includes(
    code as SignalTrackerRetryableDbErrorCode
  );
}

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

export const getTopicRequestSchema = z.object({
  topicId: trimmedRequiredString
});

export type GetTopicRequest = z.infer<typeof getTopicRequestSchema>;

export const getTopicResponseSchema = z.object({
  topic: topicSchema
});

export type GetTopicResponse = z.infer<typeof getTopicResponseSchema>;

export const listTopicsRequestSchema = z.object({
  query: optionalTrimmedString
});

export type ListTopicsRequest = z.infer<typeof listTopicsRequestSchema>;

export const listTopicsResponseSchema = z.object({
  topics: z.array(topicSchema)
});

export type ListTopicsResponse = z.infer<typeof listTopicsResponseSchema>;
