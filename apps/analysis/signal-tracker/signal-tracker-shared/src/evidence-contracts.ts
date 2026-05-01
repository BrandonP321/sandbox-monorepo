import { z } from "zod";

import { trimmedRequiredString } from "./common-schemas.js";

const optionalTrimmedString = z.string().trim().min(1).optional();
const optionalTrimmedUrl = z.string().trim().url().optional();

const metadataSchema = z.record(z.string(), z.unknown());

function isHttpUrl(value: string): boolean {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export const sourceTypeSchema = z.enum([
  "news",
  "government",
  "court",
  "academic",
  "think_tank",
  "organization",
  "user_uploaded",
  "other"
]);
export type SourceType = z.infer<typeof sourceTypeSchema>;

export const sourceSchema = z.object({
  id: trimmedRequiredString,
  canonicalName: trimmedRequiredString,
  baseUrl: optionalTrimmedUrl,
  sourceType: sourceTypeSchema,
  notes: optionalTrimmedString,
  createdAt: trimmedRequiredString,
  updatedAt: trimmedRequiredString
});
export type Source = z.infer<typeof sourceSchema>;

export const evidenceItemSchema = z.object({
  id: trimmedRequiredString,
  sourceId: trimmedRequiredString,
  canonicalUrl: optionalTrimmedUrl,
  title: trimmedRequiredString,
  author: optionalTrimmedString,
  publishedAt: optionalTrimmedString,
  capturedAt: trimmedRequiredString,
  contentType: optionalTrimmedString,
  language: optionalTrimmedString,
  snapshotHash: optionalTrimmedString,
  storageKey: optionalTrimmedString,
  metadata: metadataSchema.default({}),
  createdAt: trimmedRequiredString,
  updatedAt: trimmedRequiredString
});
export type EvidenceItem = z.infer<typeof evidenceItemSchema>;

export const evidenceRecordSchema = z.object({
  source: sourceSchema,
  evidenceItem: evidenceItemSchema
});
export type EvidenceRecord = z.infer<typeof evidenceRecordSchema>;

export const createEvidenceItemRequestSchema = z.object({
  source: z.object({
    canonicalName: trimmedRequiredString,
    baseUrl: optionalTrimmedUrl,
    sourceType: sourceTypeSchema,
    notes: optionalTrimmedString
  }),
  canonicalUrl: optionalTrimmedUrl,
  title: trimmedRequiredString,
  author: optionalTrimmedString,
  publishedAt: optionalTrimmedString,
  capturedAt: optionalTrimmedString,
  contentType: optionalTrimmedString,
  language: optionalTrimmedString,
  snapshotHash: optionalTrimmedString,
  storageKey: optionalTrimmedString,
  metadata: metadataSchema.optional()
});
export type CreateEvidenceItemRequest = z.infer<
  typeof createEvidenceItemRequestSchema
>;

export const createEvidenceItemResponseSchema = evidenceRecordSchema;
export type CreateEvidenceItemResponse = z.infer<
  typeof createEvidenceItemResponseSchema
>;

export const captureEvidenceUrlRequestSchema = z.object({
  url: z.string().trim().url().refine(isHttpUrl, {
    message: "URL must use http or https"
  }),
  source: z
    .object({
      canonicalName: optionalTrimmedString,
      sourceType: sourceTypeSchema.optional(),
      notes: optionalTrimmedString
    })
    .optional(),
  title: optionalTrimmedString,
  author: optionalTrimmedString,
  publishedAt: optionalTrimmedString,
  contentType: optionalTrimmedString,
  language: optionalTrimmedString,
  metadata: metadataSchema.optional()
});
export type CaptureEvidenceUrlRequest = z.infer<
  typeof captureEvidenceUrlRequestSchema
>;

export const captureEvidenceUrlResponseSchema = evidenceRecordSchema;
export type CaptureEvidenceUrlResponse = z.infer<
  typeof captureEvidenceUrlResponseSchema
>;

export const getEvidenceItemRequestSchema = z.object({
  evidenceItemId: trimmedRequiredString
});
export type GetEvidenceItemRequest = z.infer<
  typeof getEvidenceItemRequestSchema
>;

export const getEvidenceItemResponseSchema = evidenceRecordSchema;
export type GetEvidenceItemResponse = z.infer<
  typeof getEvidenceItemResponseSchema
>;
