export const weddingWebsiteApiErrorCodes = {
  validationError: "VALIDATION_ERROR",
  idempotencyConflict: "IDEMPOTENCY_CONFLICT",
  payloadTooLarge: "PAYLOAD_TOO_LARGE",
  throttled: "THROTTLED",
  internalError: "INTERNAL_ERROR",
  persistenceUnavailable: "PERSISTENCE_UNAVAILABLE"
} as const;

export type WeddingWebsiteApiErrorCode =
  (typeof weddingWebsiteApiErrorCodes)[keyof typeof weddingWebsiteApiErrorCodes];
