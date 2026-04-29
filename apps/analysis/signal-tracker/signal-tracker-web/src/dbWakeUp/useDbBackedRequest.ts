import { useCallback, useRef, useState } from "react";

import {
  runDbBackedRequest,
  type DbBackedRequestContext,
  type DbBackedRequestOptions
} from "../api/db-backed-request";

export type DbBackedRequestState<TResponse> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "waking" }
  | { status: "success"; data: TResponse }
  | { status: "error"; error: unknown };

export type UseDbBackedRequestResult<TResponse> = {
  state: DbBackedRequestState<TResponse>;
  run(): Promise<TResponse | undefined>;
  reset(): void;
};

export function useDbBackedRequest<TResponse>(
  request: (context: DbBackedRequestContext) => Promise<TResponse>,
  options: DbBackedRequestOptions = {}
): UseDbBackedRequestResult<TResponse> {
  const [state, setState] = useState<DbBackedRequestState<TResponse>>({
    status: "idle"
  });
  const latestRunId = useRef(0);

  const run = useCallback(async () => {
    const runId = latestRunId.current + 1;
    latestRunId.current = runId;
    setState({ status: "loading" });

    try {
      const data = await runDbBackedRequest(request, {
        ...options,
        onProgress: (progress) => {
          options.onProgress?.(progress);
          if (latestRunId.current !== runId) {
            return;
          }
          setState({ status: progress.phase });
        }
      });

      if (latestRunId.current === runId) {
        setState({ status: "success", data });
      }

      return data;
    } catch (error) {
      if (latestRunId.current === runId) {
        setState({ status: "error", error });
      }

      return undefined;
    }
  }, [options, request]);

  const reset = useCallback(() => {
    latestRunId.current += 1;
    setState({ status: "idle" });
  }, []);

  return { state, run, reset };
}
