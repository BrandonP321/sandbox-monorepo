import type { DbBackedRequestState } from "./useDbBackedRequest";

type DbWakeUpStatusProps<TResponse> = {
  state: DbBackedRequestState<TResponse>;
  onRetry: () => void;
};

export function DbWakeUpStatus<TResponse>({
  state,
  onRetry
}: DbWakeUpStatusProps<TResponse>) {
  if (state.status === "waking") {
    return (
      <p className="status-text db-wake-up-status" role="status">
        The database is waking up after inactivity. This can take a few seconds.
        Retrying automatically...
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <div className="db-wake-up-status db-wake-up-status--error" role="alert">
        <p className="status-text status-text--error">
          The database-backed request could not be completed.
        </p>
        <button
          className="db-wake-up-status__retry"
          type="button"
          onClick={onRetry}
        >
          Try again
        </button>
      </div>
    );
  }

  return null;
}
