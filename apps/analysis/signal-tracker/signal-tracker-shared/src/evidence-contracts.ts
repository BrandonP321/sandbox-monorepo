import { z } from "zod";

import { trimmedRequiredString } from "./common-schemas.js";

const optionalTrimmedString = z.string().trim().min(1).optional();
const optionalTrimmedUrl = z.string().trim().url().optional();

const metadataSchema = z.record(z.string(), z.unknown());
const locatorSchema = z.record(z.string(), z.unknown());
const positionSchema = z.number().int().min(0);

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

export const listEvidenceItemsRequestSchema = z.object({
  query: optionalTrimmedString
});
export type ListEvidenceItemsRequest = z.infer<
  typeof listEvidenceItemsRequestSchema
>;

export const listEvidenceItemsResponseSchema = z.object({
  evidence: z.array(evidenceRecordSchema)
});
export type ListEvidenceItemsResponse = z.infer<
  typeof listEvidenceItemsResponseSchema
>;

function hasLocatorFields(anchor: EvidenceAnchorLocatorFields): boolean {
  return (
    anchor.quoteText !== undefined ||
    anchor.pageLabel !== undefined ||
    anchor.startPos !== undefined ||
    Object.keys(anchor.locator ?? {}).length > 0
  );
}

function hasCompletePositionRange(
  anchor: EvidenceAnchorLocatorFields
): boolean {
  return (
    (anchor.startPos === undefined && anchor.endPos === undefined) ||
    (anchor.startPos !== undefined && anchor.endPos !== undefined)
  );
}

function hasOrderedPositionRange(anchor: EvidenceAnchorLocatorFields): boolean {
  return (
    anchor.startPos === undefined ||
    anchor.endPos === undefined ||
    anchor.startPos <= anchor.endPos
  );
}

type EvidenceAnchorLocatorFields = {
  quoteText?: string;
  pageLabel?: string;
  startPos?: number;
  endPos?: number;
  locator?: Record<string, unknown>;
};

function refineEvidenceAnchorLocatorFields<
  T extends EvidenceAnchorLocatorFields
>(schema: z.ZodType<T>) {
  return schema.superRefine((anchor, context) => {
    if (!hasCompletePositionRange(anchor)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "startPos and endPos must be provided together",
        path: anchor.startPos === undefined ? ["startPos"] : ["endPos"]
      });
    }

    if (!hasOrderedPositionRange(anchor)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "startPos must be less than or equal to endPos",
        path: ["startPos"]
      });
    }

    if (!hasLocatorFields(anchor)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Provide quoteText, pageLabel, startPos/endPos, or locator details"
      });
    }
  });
}

const evidenceAnchorLocatorFieldsSchema = {
  quoteText: optionalTrimmedString,
  prefix: optionalTrimmedString,
  suffix: optionalTrimmedString,
  pageLabel: optionalTrimmedString,
  startPos: positionSchema.optional(),
  endPos: positionSchema.optional(),
  locator: locatorSchema.default({})
} as const;

export const evidenceAnchorSchema = refineEvidenceAnchorLocatorFields(
  z.object({
    id: trimmedRequiredString,
    evidenceItemId: trimmedRequiredString,
    ...evidenceAnchorLocatorFieldsSchema,
    createdAt: trimmedRequiredString,
    updatedAt: trimmedRequiredString
  })
);
export type EvidenceAnchor = z.infer<typeof evidenceAnchorSchema>;

export const createEvidenceAnchorRequestSchema =
  refineEvidenceAnchorLocatorFields(
    z.object({
      evidenceItemId: trimmedRequiredString,
      ...evidenceAnchorLocatorFieldsSchema
    })
  );
export type CreateEvidenceAnchorRequest = z.infer<
  typeof createEvidenceAnchorRequestSchema
>;

export const createEvidenceAnchorResponseSchema = z.object({
  anchor: evidenceAnchorSchema
});
export type CreateEvidenceAnchorResponse = z.infer<
  typeof createEvidenceAnchorResponseSchema
>;

export const getEvidenceAnchorRequestSchema = z.object({
  anchorId: trimmedRequiredString
});
export type GetEvidenceAnchorRequest = z.infer<
  typeof getEvidenceAnchorRequestSchema
>;

export const getEvidenceAnchorResponseSchema = z.object({
  anchor: evidenceAnchorSchema
});
export type GetEvidenceAnchorResponse = z.infer<
  typeof getEvidenceAnchorResponseSchema
>;

export const listEvidenceAnchorsForItemRequestSchema = z.object({
  evidenceItemId: trimmedRequiredString
});
export type ListEvidenceAnchorsForItemRequest = z.infer<
  typeof listEvidenceAnchorsForItemRequestSchema
>;

export const listEvidenceAnchorsForItemResponseSchema = z.object({
  anchors: z.array(evidenceAnchorSchema)
});
export type ListEvidenceAnchorsForItemResponse = z.infer<
  typeof listEvidenceAnchorsForItemResponseSchema
>;
