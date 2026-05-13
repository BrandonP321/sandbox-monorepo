import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { apiErrorSchema } from "@repo/api-contracts";
import { signalTrackerApiErrorCodes } from "@repo/signal-tracker-shared";

const persistenceRetrySliceName = "persistenceRetry";

const persistenceRetryDelaysMs = [2_000, 5_000, 10_000, 15_000] as const;

type PersistenceRetryRequestType = "mutation" | "query";

type PersistenceRetryNotification = {
  attempt: number;
  endpointName: string;
  id: number;
  requestType: PersistenceRetryRequestType;
};

type PersistenceRetryScheduledPayload = Omit<
  PersistenceRetryNotification,
  "id"
>;

type PersistenceRetryState = {
  acknowledgedNotificationId: number | undefined;
  latestNotification: PersistenceRetryNotification | undefined;
  nextNotificationId: number;
};

const initialState: PersistenceRetryState = {
  acknowledgedNotificationId: undefined,
  latestNotification: undefined,
  nextNotificationId: 1
};

const persistenceRetrySlice = createSlice({
  initialState,
  name: persistenceRetrySliceName,
  reducers: {
    persistenceRetryNotificationAcknowledged(
      state,
      action: PayloadAction<number>
    ) {
      state.acknowledgedNotificationId = action.payload;
    },
    persistenceRetryScheduled(
      state,
      action: PayloadAction<PersistenceRetryScheduledPayload>
    ) {
      state.latestNotification = {
        ...action.payload,
        id: state.nextNotificationId
      };
      state.nextNotificationId += 1;
    }
  },
  selectors: {
    selectPendingPersistenceRetryNotification(state) {
      if (
        !state.latestNotification ||
        state.latestNotification.id === state.acknowledgedNotificationId
      ) {
        return undefined;
      }

      return state.latestNotification;
    }
  }
});

function getPersistenceRetryDelayMs(attempt: number): number {
  const delay = persistenceRetryDelaysMs[attempt - 1];

  return delay ?? persistenceRetryDelaysMs[persistenceRetryDelaysMs.length - 1];
}

async function waitForPersistenceRetryBackoff(
  attempt: number,
  _maxRetries: number,
  signal?: AbortSignal
) {
  const delayMs = getPersistenceRetryDelayMs(attempt);

  await waitForDelay(delayMs, signal);
}

function isPersistenceUnavailableApiError(error: unknown): boolean {
  return (
    getApiErrorCode(error) === signalTrackerApiErrorCodes.persistenceUnavailable
  );
}

function getApiErrorCode(error: unknown): string | undefined {
  const directCode = parseApiErrorCode(error);

  if (directCode) {
    return directCode;
  }

  if (!isRecord(error) || !("data" in error)) {
    return undefined;
  }

  return parseApiErrorCode(error.data);
}

function parseApiErrorCode(error: unknown): string | undefined {
  const parsedError = apiErrorSchema.safeParse(error);

  if (!parsedError.success) {
    return undefined;
  }

  return parsedError.data.error.code;
}

function waitForDelay(delayMs: number, signal: AbortSignal | undefined) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("Aborted"));
      return;
    }

    const timeout = setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve();
    }, delayMs);

    function handleAbort() {
      clearTimeout(timeout);
      reject(new Error("Aborted"));
    }

    signal?.addEventListener("abort", handleAbort, { once: true });
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

const { persistenceRetryNotificationAcknowledged, persistenceRetryScheduled } =
  persistenceRetrySlice.actions;

const { selectPendingPersistenceRetryNotification } =
  persistenceRetrySlice.selectors;

export {
  getPersistenceRetryDelayMs,
  isPersistenceUnavailableApiError,
  persistenceRetryDelaysMs,
  persistenceRetryNotificationAcknowledged,
  persistenceRetryScheduled,
  persistenceRetrySliceName,
  selectPendingPersistenceRetryNotification,
  waitForPersistenceRetryBackoff
};
export type {
  PersistenceRetryNotification,
  PersistenceRetryRequestType,
  PersistenceRetryState
};
export default persistenceRetrySlice.reducer;
