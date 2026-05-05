import { z } from "zod";

import { trimmedRequiredString } from "@repo/schema-utils";
import { assessmentUpdateSchema } from "./assessment-contracts.js";
import { entrySchema } from "./entry-contracts.js";

export const assessmentTimelineMetadataSchema = assessmentUpdateSchema.omit({
  entry: true
});
export type AssessmentTimelineMetadata = z.infer<
  typeof assessmentTimelineMetadataSchema
>;

const eventTimelineEntrySchema = entrySchema.extend({
  kind: z.literal("event")
});

const reviewTimelineEntrySchema = entrySchema.extend({
  kind: z.literal("review")
});

const assessmentTimelineEntrySchema = entrySchema.extend({
  kind: z.literal("assessment")
});

export const topicTimelineItemSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("event"),
    entry: eventTimelineEntrySchema
  }),
  z.object({
    kind: z.literal("review"),
    entry: reviewTimelineEntrySchema
  }),
  z.object({
    kind: z.literal("assessment"),
    entry: assessmentTimelineEntrySchema,
    assessment: assessmentTimelineMetadataSchema
  })
]);

export type TopicTimelineItem = z.infer<typeof topicTimelineItemSchema>;

export const listTopicTimelineRequestSchema = z.object({
  topicId: trimmedRequiredString,
  limit: z.number().int().min(1).optional()
});

export type ListTopicTimelineRequest = z.infer<
  typeof listTopicTimelineRequestSchema
>;

export const listTopicTimelineResponseSchema = z.object({
  items: z.array(topicTimelineItemSchema)
});

export type ListTopicTimelineResponse = z.infer<
  typeof listTopicTimelineResponseSchema
>;
