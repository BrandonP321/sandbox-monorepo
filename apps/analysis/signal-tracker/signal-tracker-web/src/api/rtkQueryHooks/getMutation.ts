import type {
  BaseQueryFn,
  MutationDefinition,
  MutationResultSelectorResult
} from "@reduxjs/toolkit/query";
import type {
  TypedMutationTrigger,
  TypedUseMutation,
  TypedUseMutationResult
} from "@reduxjs/toolkit/query/react";

import { withErrorMessage, type WithErrorMessage } from "./rtkQueryHooksShared";

type MutationHookOptions<
  TResultType,
  TQueryArg,
  TBaseQuery extends BaseQueryFn,
  TResult extends Record<string, unknown>
> = {
  fixedCacheKey?: string;
  selectFromResult?: (
    state: MutationResultSelectorResult<
      MutationDefinition<TQueryArg, TBaseQuery, string, TResultType>
    >
  ) => TResult;
};

type MutationHookResult<
  TResultType,
  TQueryArg,
  TBaseQuery extends BaseQueryFn,
  TResult extends Record<string, unknown>
> = readonly [
  TypedMutationTrigger<TResultType, TQueryArg, TBaseQuery>,
  TypedUseMutationResult<TResultType, TQueryArg, TBaseQuery, TResult>
];

type MutationHookResultWithErrorMessage<
  TResultType,
  TQueryArg,
  TBaseQuery extends BaseQueryFn,
  TResult extends Record<string, unknown>
> = readonly [
  MutationHookResult<TResultType, TQueryArg, TBaseQuery, TResult>[0],
  WithErrorMessage<
    MutationHookResult<TResultType, TQueryArg, TBaseQuery, TResult>[1]
  >
];

type MutationHookWithErrorMessage<
  TResultType,
  TQueryArg,
  TBaseQuery extends BaseQueryFn
> = <
  TResult extends Record<string, unknown> = MutationResultSelectorResult<
    MutationDefinition<TQueryArg, TBaseQuery, string, TResultType>
  >
>(
  options?: MutationHookOptions<TResultType, TQueryArg, TBaseQuery, TResult>
) => MutationHookResultWithErrorMessage<
  TResultType,
  TQueryArg,
  TBaseQuery,
  TResult
>;

function getMutation<TResultType, TQueryArg, TBaseQuery extends BaseQueryFn>(
  mutationHook: TypedUseMutation<TResultType, TQueryArg, TBaseQuery>
): MutationHookWithErrorMessage<TResultType, TQueryArg, TBaseQuery> {
  return ((options) => {
    const hookResult = mutationHook(options);
    const mutation = hookResult[0];
    const result = hookResult[1];

    return [mutation, withErrorMessage(result)];
  }) as <
    TResult extends Record<string, unknown> = MutationResultSelectorResult<
      MutationDefinition<TQueryArg, TBaseQuery, string, TResultType>
    >
  >(
    options?: MutationHookOptions<TResultType, TQueryArg, TBaseQuery, TResult>
  ) => MutationHookResultWithErrorMessage<
    TResultType,
    TQueryArg,
    TBaseQuery,
    TResult
  >;
}

export { getMutation };
