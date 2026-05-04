import { getApiErrorMessage } from "../apiError";

type WithErrorMessage<TResult> = TResult extends unknown
  ? TResult & {
      errorMessage: string | undefined;
    }
  : never;

function withErrorMessage<TResult>(result: TResult): WithErrorMessage<TResult> {
  const error =
    typeof result === "object" && result !== null && "error" in result
      ? result.error
      : undefined;

  return {
    ...result,
    errorMessage: error === undefined ? undefined : getApiErrorMessage(error)
  } as WithErrorMessage<TResult>;
}

export { withErrorMessage };
export type { WithErrorMessage };
