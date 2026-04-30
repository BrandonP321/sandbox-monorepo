import { z } from "zod";

import { trimmedRequiredString } from "./common-schemas.js";

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

export const createEventEntryRequestSchema = z.object({
  topicId: trimmedRequiredString,
  title: trimmedRequiredString,
  bodyMd: trimmedRequiredString,
  sortAt: trimmedRequiredString,
  epistemicStatus: entryEpistemicStatusSchema
});

export type CreateEventEntryRequest = z.infer<
  typeof createEventEntryRequestSchema
>;

export const createEventEntryResponseSchema = z.object({
  entry: entrySchema
});

export type CreateEventEntryResponse = z.infer<
  typeof createEventEntryResponseSchema
>;

export const getEventEntryRequestSchema = z.object({
  entryId: trimmedRequiredString
});

export type GetEventEntryRequest = z.infer<typeof getEventEntryRequestSchema>;

export const getEventEntryResponseSchema = z.object({
  entry: entrySchema
});

export type GetEventEntryResponse = z.infer<typeof getEventEntryResponseSchema>;

export const listEventEntriesRequestSchema = z.object({
  topicId: trimmedRequiredString
});

export type ListEventEntriesRequest = z.infer<
  typeof listEventEntriesRequestSchema
>;

export const listEventEntriesResponseSchema = z.object({
  entries: z.array(entrySchema)
});

export type ListEventEntriesResponse = z.infer<
  typeof listEventEntriesResponseSchema
>;

export const updateEventEntryRequestSchema = z
  .object({
    entryId: trimmedRequiredString,
    title: trimmedRequiredString.optional(),
    bodyMd: trimmedRequiredString.optional(),
    sortAt: trimmedRequiredString.optional(),
    epistemicStatus: entryEpistemicStatusSchema.optional()
  })
  .refine(
    ({ title, bodyMd, sortAt, epistemicStatus }) =>
      title !== undefined ||
      bodyMd !== undefined ||
      sortAt !== undefined ||
      epistemicStatus !== undefined,
    "At least one editable event entry field is required"
  );

export type UpdateEventEntryRequest = z.infer<
  typeof updateEventEntryRequestSchema
>;

export const updateEventEntryResponseSchema = z.object({
  entry: entrySchema
});

export type UpdateEventEntryResponse = z.infer<
  typeof updateEventEntryResponseSchema
>;
