import { AppError } from "@repo/api-core";
import { signalTrackerApiErrorCodes } from "@repo/signal-tracker-shared";

export function createPersistenceUnavailableError(): AppError {
  return new AppError(
    signalTrackerApiErrorCodes.persistenceUnavailable,
    "Topic persistence is temporarily unavailable",
    503
  );
}
