import { afterEach, describe, expect, it, vi } from "vitest";

import { SignalTrackerApiError } from "./client";
import {
  DB_BACKED_API_DEFAULTS,
  isRetryableDbBackedRequestError,
  runDbBackedRequest
} from "./db-backed-request";

afterEach(() => {
  vi.useRealTimers();
});

describe("runDbBackedRequest", () => {
  it("does not report wake-up state for fast success", async () => {
    const onProgress = vi.fn();

    await expect(
      runDbBackedRequest(async () => "ok", { onProgress })
    ).resolves.toBe("ok");

    expect(onProgress).toHaveBeenCalledWith({
      phase: "loading",
      attempt: 1,
      maxAttempts: DB_BACKED_API_DEFAULTS.maxAttempts
    });
    expect(onProgress).not.toHaveBeenCalledWith(
      expect.objectContaining({ phase: "waking" })
    );
  });

  it("reports wake-up state after the slow-call threshold", async () => {
    vi.useFakeTimers();
    const onProgress = vi.fn();

    const result = runDbBackedRequest(
      async () =>
        new Promise<string>((resolve) => {
          window.setTimeout(() => resolve("ok"), 5_000);
        }),
      { onProgress }
    );

    await vi.advanceTimersByTimeAsync(3_999);
    expect(onProgress).not.toHaveBeenCalledWith(
      expect.objectContaining({ phase: "waking" })
    );

    await vi.advanceTimersByTimeAsync(1);
    expect(onProgress).toHaveBeenCalledWith({
      phase: "waking",
      attempt: 1,
      maxAttempts: DB_BACKED_API_DEFAULTS.maxAttempts
    });

    await vi.advanceTimersByTimeAsync(1_000);
    await expect(result).resolves.toBe("ok");
  });

  it("retries transient DB-backed failures", async () => {
    vi.useFakeTimers();
    const request = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(
        new SignalTrackerApiError(
          503,
          "PERSISTENCE_UNAVAILABLE",
          "Persistence unavailable"
        )
      )
      .mockResolvedValueOnce("ok");

    const result = runDbBackedRequest(request, {
      retryDelaysMs: [1_000]
    });

    await vi.advanceTimersByTimeAsync(1_000);

    await expect(result).resolves.toBe("ok");
    expect(request).toHaveBeenCalledTimes(2);
  });

  it("uses a longer default retry budget for dormant database wake-up", async () => {
    vi.useFakeTimers();
    const error = new SignalTrackerApiError(
      503,
      "PERSISTENCE_UNAVAILABLE",
      "Persistence unavailable"
    );
    const request = vi.fn<() => Promise<string>>().mockRejectedValue(error);

    const result = runDbBackedRequest(request);
    const expectation = expect(result).rejects.toBe(error);

    await vi.advanceTimersByTimeAsync(32_000);

    await expectation;
    expect(request).toHaveBeenCalledTimes(5);
  });

  it("stops after bounded transient retry attempts", async () => {
    vi.useFakeTimers();
    const error = new SignalTrackerApiError(
      503,
      "PERSISTENCE_UNAVAILABLE",
      "Persistence unavailable"
    );
    const request = vi.fn<() => Promise<string>>().mockRejectedValue(error);

    const result = runDbBackedRequest(request, {
      maxAttempts: 2,
      retryDelaysMs: [250]
    });
    const expectation = expect(result).rejects.toBe(error);

    await vi.advanceTimersByTimeAsync(250);

    await expectation;
    expect(request).toHaveBeenCalledTimes(2);
  });

  it("does not retry validation errors", async () => {
    const error = new SignalTrackerApiError(
      400,
      "VALIDATION_ERROR",
      "Validation failed"
    );
    const request = vi.fn<() => Promise<string>>().mockRejectedValue(error);

    await expect(
      runDbBackedRequest(request, { retryDelaysMs: [1] })
    ).rejects.toBe(error);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("classifies network and timeout failures as retryable", () => {
    expect(isRetryableDbBackedRequestError(new TypeError("network"))).toBe(
      true
    );
    expect(
      isRetryableDbBackedRequestError(
        new DOMException("The request was aborted.", "AbortError")
      )
    ).toBe(true);
    expect(
      isRetryableDbBackedRequestError(
        new SignalTrackerApiError(404, "TOPIC_NOT_FOUND", "Topic not found")
      )
    ).toBe(false);
  });
});
