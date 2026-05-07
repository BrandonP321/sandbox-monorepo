import { z } from "zod";

import {
  optionalTrimmedString,
  trimmedRequiredString,
  trimmedRequiredStringArray
} from "@repo/schema-utils";
import {
  entryReadModelSchema,
  entrySchema,
  entrySourceInputSchema
} from "./entry-contracts.js";

export const assessmentConfidenceLabelSchema = z.enum([
  "low",
  "medium",
  "high"
]);
export type AssessmentConfidenceLabel = z.infer<
  typeof assessmentConfidenceLabelSchema
>;

export const assessmentUpdateSchema = z.object({
  entry: entrySchema,
  judgment: trimmedRequiredString,
  confidenceLabel: assessmentConfidenceLabelSchema,
  probabilityPct: z.number().int().min(0).max(100).optional(),
  assumptions: trimmedRequiredStringArray,
  indicators: trimmedRequiredStringArray,
  resolutionCriteria: optionalTrimmedString,
  targetResolvesAt: optionalTrimmedString,
  previousAssessmentEntryId: optionalTrimmedString
});

export type AssessmentUpdate = z.infer<typeof assessmentUpdateSchema>;

export const assessmentUpdateReadModelSchema = assessmentUpdateSchema.extend({
  entry: entryReadModelSchema
});

export type AssessmentUpdateReadModel = z.infer<
  typeof assessmentUpdateReadModelSchema
>;

export const createAssessmentUpdateRequestSchema = z.object({
  topicId: trimmedRequiredString,
  title: optionalTrimmedString,
  judgment: trimmedRequiredString,
  confidenceLabel: assessmentConfidenceLabelSchema,
  probabilityPct: z.number().int().min(0).max(100).optional(),
  assumptions: trimmedRequiredStringArray,
  indicators: trimmedRequiredStringArray,
  resolutionCriteria: optionalTrimmedString,
  targetResolvesAt: optionalTrimmedString,
  sortAt: trimmedRequiredString,
  sources: z.array(entrySourceInputSchema).optional()
});

export type CreateAssessmentUpdateRequest = z.infer<
  typeof createAssessmentUpdateRequestSchema
>;

export const createAssessmentUpdateResponseSchema = z.object({
  assessmentUpdate: assessmentUpdateSchema
});

export type CreateAssessmentUpdateResponse = z.infer<
  typeof createAssessmentUpdateResponseSchema
>;
