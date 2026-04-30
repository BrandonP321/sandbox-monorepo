import { AppError } from "@repo/api-core";
import { signalTrackerApiErrorCodes } from "@repo/signal-tracker-shared";

export function createPersistenceUnavailableError(): AppError {
  return new AppError(
    signalTrackerApiErrorCodes.persistenceUnavailable,
    "Topic persistence is temporarily unavailable",
    503
  );
}

export function createTopicNotFoundError(): AppError {
  return new AppError(
    signalTrackerApiErrorCodes.topicNotFound,
    "Topic not found",
    404
  );
}

export function createEventEntryNotFoundError(): AppError {
  return new AppError(
    signalTrackerApiErrorCodes.eventEntryNotFound,
    "Event entry not found",
    404
  );
}
