export const weddingWebsiteApiErrorCodes = {
  adminReadUnavailable: "ADMIN_READ_UNAVAILABLE",
  adminUnauthorized: "ADMIN_UNAUTHORIZED",
  validationError: "VALIDATION_ERROR",
  idempotencyConflict: "IDEMPOTENCY_CONFLICT",
  payloadTooLarge: "PAYLOAD_TOO_LARGE",
  throttled: "THROTTLED",
  internalError: "INTERNAL_ERROR",
  persistenceUnavailable: "PERSISTENCE_UNAVAILABLE"
} as const;

export type WeddingWebsiteApiErrorCode =
  (typeof weddingWebsiteApiErrorCodes)[keyof typeof weddingWebsiteApiErrorCodes];
