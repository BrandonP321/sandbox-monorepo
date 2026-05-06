import type { TagDescription } from "@reduxjs/toolkit/query";

function invalidateTagsOnSuccess<TResult, TRequest, TTag extends string>(
  result: TResult | undefined,
  error: unknown,
  request: TRequest,
  getTags: (
    result: TResult,
    request: TRequest
  ) => ReadonlyArray<TagDescription<TTag> | null | undefined>
) {
  if (error || result === undefined) {
    return [];
  }

  return getTags(result, request);
}

export { invalidateTagsOnSuccess };
