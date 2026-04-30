import { isSignalTrackerRetryableDbErrorCode } from "@repo/signal-tracker-shared";

import {
  postSignalTrackerApi,
  SignalTrackerApiError,
  type SignalTrackerApiPostOptions
} from "./client";

export const DB_BACKED_API_DEFAULTS = {
  wakeUpDelayMs: 4_000,
  requestTimeoutMs: 20_000,
  maxAttempts: 5,
  retryDelaysMs: [2_000, 5_000, 10_000, 15_000]
} as const;

export type DbBackedRequestProgressPhase = "loading" | "waking";

export type DbBackedRequestProgress = {
  phase: DbBackedRequestProgressPhase;
  attempt: number;
  maxAttempts: number;
};

export type DbBackedRequestContext = {
  signal: AbortSignal;
  attempt: number;
};

export type DbBackedRequestOptions = {
  wakeUpDelayMs?: number;
  requestTimeoutMs?: number;
  maxAttempts?: number;
  retryDelaysMs?: readonly number[];
  signal?: AbortSignal;
  onProgress?: (progress: DbBackedRequestProgress) => void;
};

type AttemptSignal = {
  signal: AbortSignal;
  cleanup(): void;
};

export async function postSignalTrackerDbBackedApi<TResponse>(
  options: SignalTrackerApiPostOptions<TResponse>,
  requestOptions?: DbBackedRequestOptions
): Promise<TResponse> {
  return runDbBackedRequest(
    ({ signal }) =>
      postSignalTrackerApi({
        ...options,
        signal
      }),
    requestOptions
  );
}

export async function runDbBackedRequest<TResponse>(
  request: (context: DbBackedRequestContext) => Promise<TResponse>,
  options: DbBackedRequestOptions = {}
): Promise<TResponse> {
  const wakeUpDelayMs =
    options.wakeUpDelayMs ?? DB_BACKED_API_DEFAULTS.wakeUpDelayMs;
  const requestTimeoutMs =
    options.requestTimeoutMs ?? DB_BACKED_API_DEFAULTS.requestTimeoutMs;
  const maxAttempts = options.maxAttempts ?? DB_BACKED_API_DEFAULTS.maxAttempts;
  const retryDelaysMs =
    options.retryDelaysMs ?? DB_BACKED_API_DEFAULTS.retryDelaysMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    options.onProgress?.({ phase: "loading", attempt, maxAttempts });

    const attemptSignal = createAttemptSignal(options.signal, requestTimeoutMs);
    const wakeUpTimer = window.setTimeout(() => {
      options.onProgress?.({ phase: "waking", attempt, maxAttempts });
    }, wakeUpDelayMs);

    try {
      return await request({ signal: attemptSignal.signal, attempt });
    } catch (error) {
      if (options.signal?.aborted) {
        throw error;
      }

      const canRetry =
        attempt < maxAttempts && isRetryableDbBackedRequestError(error);

      if (!canRetry) {
        throw error;
      }

      await delay(retryDelaysMs[attempt - 1] ?? 0, options.signal);
    } finally {
      window.clearTimeout(wakeUpTimer);
      attemptSignal.cleanup();
    }
  }

  throw new Error("DB-backed request failed without returning a result.");
}

export function isRetryableDbBackedRequestError(error: unknown): boolean {
  if (error instanceof SignalTrackerApiError) {
    return isSignalTrackerRetryableDbErrorCode(error.code);
  }

  if (isAbortError(error)) {
    return true;
  }

  return error instanceof TypeError;
}

function createAttemptSignal(
  parentSignal: AbortSignal | undefined,
  requestTimeoutMs: number
): AttemptSignal {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, requestTimeoutMs);

  const abortAttempt = () => {
    controller.abort();
  };

  if (parentSignal?.aborted) {
    abortAttempt();
  } else {
    parentSignal?.addEventListener("abort", abortAttempt, { once: true });
  }

  return {
    signal: controller.signal,
    cleanup() {
      window.clearTimeout(timeoutId);
      parentSignal?.removeEventListener("abort", abortAttempt);
    }
  };
}

function delay(ms: number, signal: AbortSignal | undefined): Promise<void> {
  if (ms <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(resolve, ms);

    const abortDelay = () => {
      window.clearTimeout(timeoutId);
      reject(new DOMException("The request was aborted.", "AbortError"));
    };

    if (signal?.aborted) {
      abortDelay();
      return;
    }

    signal?.addEventListener("abort", abortDelay, { once: true });
  });
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
