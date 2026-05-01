import { describe, expect, it } from "vitest";

import {
  isSignalTrackerRetryableDbErrorCode,
  signalTrackerApiErrorCodes,
  signalTrackerRetryableDbErrorCodes
} from "./errors.js";

describe("signalTracker API error conventions", () => {
  it("classifies retryable DB-backed API errors", () => {
    expect(signalTrackerRetryableDbErrorCodes).toEqual([
      "PERSISTENCE_UNAVAILABLE",
      "DATABASE_UNAVAILABLE",
      "DATABASE_WAKING",
      "REQUEST_TIMEOUT"
    ]);

    expect(signalTrackerApiErrorCodes.topicNotFound).toBe("TOPIC_NOT_FOUND");
    expect(signalTrackerApiErrorCodes.eventEntryNotFound).toBe(
      "EVENT_ENTRY_NOT_FOUND"
    );
    expect(signalTrackerApiErrorCodes.reviewNoteNotFound).toBe(
      "REVIEW_NOTE_NOT_FOUND"
    );
    expect(signalTrackerApiErrorCodes.evidenceItemNotFound).toBe(
      "EVIDENCE_ITEM_NOT_FOUND"
    );
    expect(signalTrackerApiErrorCodes.evidenceAnchorNotFound).toBe(
      "EVIDENCE_ANCHOR_NOT_FOUND"
    );
    expect(
      isSignalTrackerRetryableDbErrorCode(
        signalTrackerApiErrorCodes.persistenceUnavailable
      )
    ).toBe(true);
    expect(isSignalTrackerRetryableDbErrorCode("VALIDATION_ERROR")).toBe(false);
  });
});
