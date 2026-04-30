import { z } from "zod";

import { assessmentUpdateSchema } from "./assessment-contracts.js";
import {
  optionalClearableTrimmedString,
  optionalTrimmedString,
  trimmedRequiredString
} from "./common-schemas.js";

export const topicStatusSchema = z.enum(["active", "paused", "archived"]);
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
  reviewCadence: reviewCadenceSchema,
  archivedAt: trimmedRequiredString.optional()
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
  topic: topicSchema,
  currentAssessment: assessmentUpdateSchema.nullable()
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
