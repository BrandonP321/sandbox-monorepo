import {
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  createApi,
  fetchBaseQuery
} from "@reduxjs/toolkit/query/react";

import {
  signalTrackerRouteContracts,
  type SignalTrackerHealthResponse
} from "@repo/signal-tracker-shared";

import { loadRuntimeConfig, type RuntimeConfig } from "../config";

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

export const signalTrackerApi = createApi({
  reducerPath: "signalTrackerApi",
  baseQuery: dynamicBaseQuery,
  tagTypes: ["Health"],
  endpoints: (builder) => ({
    getHealth: builder.query<SignalTrackerHealthResponse, void>({
      query: () => {
        const contract = signalTrackerRouteContracts.getHealth;

        return {
          url: contract.route.path,
          method: contract.route.method,
          body: contract.requestSchema.parse({})
        };
      },
      providesTags: ["Health"],
      transformResponse: (response: unknown) =>
        signalTrackerRouteContracts.getHealth.responseSchema.parse(response)
    })
  })
});

export const { useGetHealthQuery } = signalTrackerApi;
