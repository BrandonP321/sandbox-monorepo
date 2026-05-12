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
import { useCallback } from "react";

import { useNotifications } from "@/components/ui/Notifications";

import {
  notifyApiError,
  notifyApiSuccess,
  type RtkQueryNotificationOptions
} from "./apiNotifications";
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
  mutationHook: TypedUseMutation<TResultType, TQueryArg, TBaseQuery>,
  notificationOptions: RtkQueryNotificationOptions<TResultType>
): MutationHookWithErrorMessage<TResultType, TQueryArg, TBaseQuery> {
  function useMutationHookWithErrorMessage<
    TResult extends Record<string, unknown> = MutationResultSelectorResult<
      MutationDefinition<TQueryArg, TBaseQuery, string, TResultType>
    >
  >(
    options?: MutationHookOptions<TResultType, TQueryArg, TBaseQuery, TResult>
  ) {
    const hookResult = mutationHook(options);
    const mutation = hookResult[0];
    const result = withErrorMessage(hookResult[1]);
    const { notifyError, notifySuccess } = useNotifications();

    const mutationWithNotifications = useCallback(
      ((...args: Parameters<typeof mutation>) => {
        const mutationResult = mutation(...args);

        void mutationResult.then((settledResult) => {
          if ("data" in settledResult) {
            notifyApiSuccess(
              settledResult.data as TResultType,
              notificationOptions,
              notifySuccess
            );
            return;
          }

          if ("error" in settledResult) {
            notifyApiError(
              settledResult.error,
              notificationOptions,
              notifyError
            );
          }
        });

        return mutationResult;
      }) as typeof mutation,
      [mutation, notifyError, notifySuccess]
    );

    return [mutationWithNotifications, result];
  }

  return useMutationHookWithErrorMessage as unknown as <
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
