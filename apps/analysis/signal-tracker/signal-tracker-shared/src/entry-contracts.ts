import { z } from "zod";

import {
  createTrimmedHttpUrlString,
  trimmedRequiredString
} from "@repo/schema-utils";
import { entryCitationRelationTypeSchema } from "./citation-contracts.js";

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

export const attachedSourceSummarySchema = z.object({
  id: trimmedRequiredString,
  evidenceItemId: trimmedRequiredString,
  url: createTrimmedHttpUrlString().optional(),
  canonicalUrl: createTrimmedHttpUrlString().optional(),
  title: trimmedRequiredString,
  sourceName: trimmedRequiredString,
  sourceDomain: trimmedRequiredString.optional(),
  publishedAt: trimmedRequiredString.optional(),
  relationType: entryCitationRelationTypeSchema
});

export type AttachedSourceSummary = z.infer<typeof attachedSourceSummarySchema>;

export const entryReadModelSchema = entrySchema.extend({
  sources: z.array(attachedSourceSummarySchema).default([])
});

export type EntryReadModel = z.infer<typeof entryReadModelSchema>;

export const entrySourceInputSchema = z.object({
  url: createTrimmedHttpUrlString()
});
export type EntrySourceInput = z.infer<typeof entrySourceInputSchema>;

const entrySourcesInputSchema = z.array(entrySourceInputSchema);

export const createEventEntryRequestSchema = z.object({
  topicId: trimmedRequiredString,
  title: trimmedRequiredString,
  bodyMd: trimmedRequiredString,
  sortAt: trimmedRequiredString,
  epistemicStatus: entryEpistemicStatusSchema,
  sources: entrySourcesInputSchema.optional()
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

export const createReviewNoteRequestSchema = z.object({
  topicId: trimmedRequiredString,
  title: trimmedRequiredString,
  bodyMd: trimmedRequiredString,
  sortAt: trimmedRequiredString,
  epistemicStatus: entryEpistemicStatusSchema
});

export type CreateReviewNoteRequest = z.infer<
  typeof createReviewNoteRequestSchema
>;

export const createReviewNoteResponseSchema = z.object({
  entry: entrySchema
});

export type CreateReviewNoteResponse = z.infer<
  typeof createReviewNoteResponseSchema
>;

export const getEventEntryRequestSchema = z.object({
  entryId: trimmedRequiredString
});

export type GetEventEntryRequest = z.infer<typeof getEventEntryRequestSchema>;

export const getEventEntryResponseSchema = z.object({
  entry: entryReadModelSchema
});

export type GetEventEntryResponse = z.infer<typeof getEventEntryResponseSchema>;

export const listEventEntriesRequestSchema = z.object({
  topicId: trimmedRequiredString
});

export type ListEventEntriesRequest = z.infer<
  typeof listEventEntriesRequestSchema
>;

export const listEventEntriesResponseSchema = z.object({
  entries: z.array(entryReadModelSchema)
});

export type ListEventEntriesResponse = z.infer<
  typeof listEventEntriesResponseSchema
>;

export const getReviewNoteRequestSchema = z.object({
  entryId: trimmedRequiredString
});

export type GetReviewNoteRequest = z.infer<typeof getReviewNoteRequestSchema>;

export const getReviewNoteResponseSchema = z.object({
  entry: entryReadModelSchema
});

export type GetReviewNoteResponse = z.infer<typeof getReviewNoteResponseSchema>;

export const listReviewNotesRequestSchema = z.object({
  topicId: trimmedRequiredString
});

export type ListReviewNotesRequest = z.infer<
  typeof listReviewNotesRequestSchema
>;

export const listReviewNotesResponseSchema = z.object({
  entries: z.array(entryReadModelSchema)
});

export type ListReviewNotesResponse = z.infer<
  typeof listReviewNotesResponseSchema
>;

export const updateEventEntryRequestSchema = z
  .object({
    entryId: trimmedRequiredString,
    title: trimmedRequiredString.optional(),
    bodyMd: trimmedRequiredString.optional(),
    sortAt: trimmedRequiredString.optional(),
    epistemicStatus: entryEpistemicStatusSchema.optional(),
    sources: entrySourcesInputSchema.optional()
  })
  .refine(
    ({ title, bodyMd, sortAt, epistemicStatus, sources }) =>
      title !== undefined ||
      bodyMd !== undefined ||
      sortAt !== undefined ||
      epistemicStatus !== undefined ||
      sources !== undefined,
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

export const replaceEntrySourcesRequestSchema = z.object({
  entryId: trimmedRequiredString,
  sources: entrySourcesInputSchema
});

export type ReplaceEntrySourcesRequest = z.infer<
  typeof replaceEntrySourcesRequestSchema
>;

export const replaceEntrySourcesResponseSchema = z.object({
  entry: entrySchema
});

export type ReplaceEntrySourcesResponse = z.infer<
  typeof replaceEntrySourcesResponseSchema
>;
