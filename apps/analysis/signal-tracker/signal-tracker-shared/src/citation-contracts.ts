import { z } from "zod";

import {
  optionalTrimmedString,
  trimmedRequiredString
} from "./common-schemas.js";
import {
  evidenceAnchorSchema,
  evidenceRecordSchema
} from "./evidence-contracts.js";

export const entryCitationRelationTypeSchema = z.enum([
  "supports",
  "contradicts",
  "contextualizes",
  "source_for"
]);
export type EntryCitationRelationType = z.infer<
  typeof entryCitationRelationTypeSchema
>;

export const entryCitationSchema = z.object({
  id: trimmedRequiredString,
  entryId: trimmedRequiredString,
  evidenceItemId: trimmedRequiredString,
  evidenceAnchorId: trimmedRequiredString.optional(),
  relationType: entryCitationRelationTypeSchema,
  note: optionalTrimmedString,
  createdAt: trimmedRequiredString
});
export type EntryCitation = z.infer<typeof entryCitationSchema>;

export const entryCitationRecordSchema = z.object({
  citation: entryCitationSchema,
  evidence: evidenceRecordSchema,
  anchor: evidenceAnchorSchema.nullable()
});
export type EntryCitationRecord = z.infer<typeof entryCitationRecordSchema>;

export const attachEntryCitationRequestSchema = z.object({
  entryId: trimmedRequiredString,
  evidenceItemId: trimmedRequiredString,
  evidenceAnchorId: trimmedRequiredString.optional(),
  relationType: entryCitationRelationTypeSchema.default("supports"),
  note: optionalTrimmedString
});
export type AttachEntryCitationRequest = z.infer<
  typeof attachEntryCitationRequestSchema
>;

export const attachEntryCitationResponseSchema = z.object({
  citation: entryCitationRecordSchema
});
export type AttachEntryCitationResponse = z.infer<
  typeof attachEntryCitationResponseSchema
>;

export const detachEntryCitationRequestSchema = z.object({
  entryId: trimmedRequiredString,
  citationId: trimmedRequiredString
});
export type DetachEntryCitationRequest = z.infer<
  typeof detachEntryCitationRequestSchema
>;

export const detachEntryCitationResponseSchema = z.object({
  citation: entryCitationRecordSchema
});
export type DetachEntryCitationResponse = z.infer<
  typeof detachEntryCitationResponseSchema
>;

export const listEntryCitationsRequestSchema = z.object({
  entryId: trimmedRequiredString
});
export type ListEntryCitationsRequest = z.infer<
  typeof listEntryCitationsRequestSchema
>;

export const listEntryCitationsResponseSchema = z.object({
  citations: z.array(entryCitationRecordSchema)
});
export type ListEntryCitationsResponse = z.infer<
  typeof listEntryCitationsResponseSchema
>;
