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

    expect(
      isSignalTrackerRetryableDbErrorCode(
        signalTrackerApiErrorCodes.persistenceUnavailable
      )
    ).toBe(true);
    expect(isSignalTrackerRetryableDbErrorCode("VALIDATION_ERROR")).toBe(false);
  });
});
