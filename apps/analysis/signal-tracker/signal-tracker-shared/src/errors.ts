export const signalTrackerApiErrorCodes = {
  persistenceUnavailable: "PERSISTENCE_UNAVAILABLE",
  databaseUnavailable: "DATABASE_UNAVAILABLE",
  databaseWaking: "DATABASE_WAKING",
  requestTimeout: "REQUEST_TIMEOUT",
  topicNotFound: "TOPIC_NOT_FOUND",
  eventEntryNotFound: "EVENT_ENTRY_NOT_FOUND",
  reviewNoteNotFound: "REVIEW_NOTE_NOT_FOUND",
  evidenceItemNotFound: "EVIDENCE_ITEM_NOT_FOUND"
} as const;

export type SignalTrackerApiErrorCode =
  (typeof signalTrackerApiErrorCodes)[keyof typeof signalTrackerApiErrorCodes];

export const signalTrackerRetryableDbErrorCodes = [
  signalTrackerApiErrorCodes.persistenceUnavailable,
  signalTrackerApiErrorCodes.databaseUnavailable,
  signalTrackerApiErrorCodes.databaseWaking,
  signalTrackerApiErrorCodes.requestTimeout
] as const;

export type SignalTrackerRetryableDbErrorCode =
  (typeof signalTrackerRetryableDbErrorCodes)[number];

export function isSignalTrackerRetryableDbErrorCode(
  code: string
): code is SignalTrackerRetryableDbErrorCode {
  return signalTrackerRetryableDbErrorCodes.includes(
    code as SignalTrackerRetryableDbErrorCode
  );
}
