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
const optionalClearableTrimmedString = z
  .union([z.string().trim(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined) {
      return undefined;
    }

    if (value === null || value === "") {
      return null;
    }

    return value;
  });

export const topicStatusSchema = z.enum(["active", "paused", "archived"]);
export type TopicStatus = z.infer<typeof topicStatusSchema>;

export const entryKindSchema = z.enum(["event", "assessment", "review"]);
export type EntryKind = z.infer<typeof entryKindSchema>;

export const entryEpistemicStatusSchema = z.enum([
  "observed",
  "reported",
  "inferred",
  "forecast"
]);
export type EntryEpistemicStatus = z.infer<typeof entryEpistemicStatusSchema>;

export const entryOriginTypeSchema = z.enum([
  "manual",
  "import",
  "ai_suggestion"
]);
export type EntryOriginType = z.infer<typeof entryOriginTypeSchema>;

export const entryStatusSchema = z.enum(["active", "archived", "deleted"]);
export type EntryStatus = z.infer<typeof entryStatusSchema>;

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
  reviewCadence: reviewCadenceSchema,
  archivedAt: trimmedRequiredString.optional()
});

export type Topic = z.infer<typeof topicSchema>;

export const entrySchema = z.object({
  id: trimmedRequiredString,
  topicId: trimmedRequiredString,
  kind: entryKindSchema,
  epistemicStatus: entryEpistemicStatusSchema,
  title: trimmedRequiredString,
  bodyMd: trimmedRequiredString,
  sortAt: trimmedRequiredString,
  isApproximateDate: z.boolean(),
  originType: entryOriginTypeSchema,
  status: entryStatusSchema,
  createdAt: trimmedRequiredString,
  updatedAt: trimmedRequiredString,
  archivedAt: trimmedRequiredString.optional(),
  deletedAt: trimmedRequiredString.optional()
});

export type Entry = z.infer<typeof entrySchema>;

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

export const updateTopicRequestSchema = z
  .object({
    topicId: trimmedRequiredString,
    title: trimmedRequiredString.optional(),
    framingQuestion: trimmedRequiredString.optional(),
    scopeNote: optionalClearableTrimmedString,
    reviewCadence: reviewCadenceSchema.optional()
  })
  .refine(
    ({ title, framingQuestion, scopeNote, reviewCadence }) =>
      title !== undefined ||
      framingQuestion !== undefined ||
      scopeNote !== undefined ||
      reviewCadence !== undefined,
    "At least one editable topic field is required"
  );

export type UpdateTopicRequest = z.infer<typeof updateTopicRequestSchema>;

export const updateTopicResponseSchema = z.object({
  topic: topicSchema
});

export type UpdateTopicResponse = z.infer<typeof updateTopicResponseSchema>;

export const archiveTopicRequestSchema = z.object({
  topicId: trimmedRequiredString
});

export type ArchiveTopicRequest = z.infer<typeof archiveTopicRequestSchema>;

export const archiveTopicResponseSchema = z.object({
  topic: topicSchema
});

export type ArchiveTopicResponse = z.infer<typeof archiveTopicResponseSchema>;

export const deleteTopicRequestSchema = z.object({
  topicId: trimmedRequiredString
});

export type DeleteTopicRequest = z.infer<typeof deleteTopicRequestSchema>;

export const deleteTopicResponseSchema = z.object({
  topic: topicSchema
});

export type DeleteTopicResponse = z.infer<typeof deleteTopicResponseSchema>;
