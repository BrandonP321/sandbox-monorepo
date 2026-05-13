import {
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  createApi,
  fetchBaseQuery
} from "@reduxjs/toolkit/query/react";

import { type SignalTrackerHealthResponse } from "@repo/signal-tracker-shared";

import { loadRuntimeConfig, type RuntimeConfig } from "../config";
import {
  buildSignalTrackerRouteRequest,
  parseSignalTrackerRouteResponse
} from "./routeContract";
import { getQuery } from "@repo/ui-base/rtk-query";
import {
  isPersistenceUnavailableApiError,
  persistenceRetryScheduled,
  waitForPersistenceRetryBackoff
} from "./persistenceRetry";

const maxPersistenceUnavailableRetries = 4;

let cachedConfig: RuntimeConfig | null = null;
let configPromise: Promise<RuntimeConfig> | null = null;

async function getRuntimeConfig() {
  if (cachedConfig) {
    return cachedConfig;
  }

  if (!configPromise) {
    configPromise = loadRuntimeConfig().then((config) => {
      cachedConfig = config;
      return config;
    });
  }

  return configPromise;
}

const dynamicBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const config = await getRuntimeConfig();
  const rawBaseQuery = fetchBaseQuery({ baseUrl: config.apiBaseUrl });

  return rawBaseQuery(args, api, extraOptions);
};

const retryingBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  for (let attempt = 0; ; attempt += 1) {
    const result = await dynamicBaseQuery(args, api, extraOptions);

    if (
      !result.error ||
      !isPersistenceUnavailableApiError(result.error) ||
      attempt >= maxPersistenceUnavailableRetries
    ) {
      return result;
    }

    const retryAttempt = attempt + 1;

    if (retryAttempt === 1) {
      api.dispatch(
        persistenceRetryScheduled({
          attempt: retryAttempt,
          endpointName: api.endpoint,
          requestType: api.type
        })
      );
    }

    await waitForPersistenceRetryBackoff(
      retryAttempt,
      maxPersistenceUnavailableRetries,
      api.signal
    );
  }
};

export const signalTrackerApi = createApi({
  reducerPath: "signalTrackerApi",
  baseQuery: retryingBaseQuery,
  tagTypes: [
    "EntryCitation",
    "EntryCitations",
    "EventEntries",
    "EventEntry",
    "Evidence",
    "EvidenceAnchor",
    "EvidenceAnchors",
    "EvidenceItem",
    "Health",
    "Topic",
    "Topics",
    "TopicTimeline"
  ],
  endpoints: (builder) => ({
    getHealth: builder.query<SignalTrackerHealthResponse, void>({
      query: () => buildSignalTrackerRouteRequest("getHealth", {}),
      providesTags: ["Health"],
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("getHealth", response)
    })
  })
});

export const useGetHealthQuery = getQuery(signalTrackerApi.useGetHealthQuery, {
  displayError: false
});
