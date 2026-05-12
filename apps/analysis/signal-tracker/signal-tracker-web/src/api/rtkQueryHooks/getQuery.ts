import type {
  BaseQueryFn,
  SkipToken,
  SubscriptionOptions
} from "@reduxjs/toolkit/query";
import type {
  TypedQueryStateSelector,
  TypedUseQuery,
  TypedUseQueryHookResult
} from "@reduxjs/toolkit/query/react";

import {
  useApiNotifications,
  type RtkQueryNotificationOptions
} from "./apiNotifications";
import { withErrorMessage, type WithErrorMessage } from "./rtkQueryHooksShared";

type QueryHookSubscriptionOptions = SubscriptionOptions & {
  refetchOnMountOrArgChange?: boolean | number;
  skip?: boolean;
};

type QueryHookOptionsWithSelectedResult<
  TResultType,
  TQueryArg,
  TBaseQuery extends BaseQueryFn,
  TSelectedResult extends Record<string, unknown>
> = QueryHookSubscriptionOptions & {
  selectFromResult: TypedQueryStateSelector<
    TResultType,
    TQueryArg,
    TBaseQuery,
    TSelectedResult
  >;
};

type QueryHookOptionsWithoutSelectedResult = QueryHookSubscriptionOptions & {
  selectFromResult?: undefined;
};

type QueryHookWithErrorMessage<
  TResultType,
  TQueryArg,
  TBaseQuery extends BaseQueryFn
> = {
  (
    arg: TQueryArg | SkipToken,
    options?: QueryHookOptionsWithoutSelectedResult
  ): WithErrorMessage<
    TypedUseQueryHookResult<TResultType, TQueryArg, TBaseQuery>
  >;
  <TSelectedResult extends Record<string, unknown>>(
    arg: TQueryArg | SkipToken,
    options: QueryHookOptionsWithSelectedResult<
      TResultType,
      TQueryArg,
      TBaseQuery,
      TSelectedResult
    >
  ): WithErrorMessage<
    TypedUseQueryHookResult<TResultType, TQueryArg, TBaseQuery, TSelectedResult>
  >;
};

function getQuery<TResultType, TQueryArg, TBaseQuery extends BaseQueryFn>(
  queryHook: TypedUseQuery<TResultType, TQueryArg, TBaseQuery>,
  notificationOptions?: RtkQueryNotificationOptions<TResultType>
): QueryHookWithErrorMessage<TResultType, TQueryArg, TBaseQuery> {
  function useQueryHookWithErrorMessage(
    arg: TQueryArg | SkipToken,
    options?:
      | QueryHookOptionsWithoutSelectedResult
      | QueryHookOptionsWithSelectedResult<
          TResultType,
          TQueryArg,
          TBaseQuery,
          Record<string, unknown>
        >
  ) {
    const result = withErrorMessage(
      queryHook(
        arg as Parameters<TypedUseQuery<TResultType, TQueryArg, TBaseQuery>>[0],
        options as Parameters<
          TypedUseQuery<TResultType, TQueryArg, TBaseQuery>
        >[1]
      )
    );

    useApiNotifications<TResultType>(result, notificationOptions);

    return result;
  }

  return useQueryHookWithErrorMessage as QueryHookWithErrorMessage<
    TResultType,
    TQueryArg,
    TBaseQuery
  >;
}

export { getQuery };
