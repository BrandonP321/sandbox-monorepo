import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery
} from "@reduxjs/toolkit/query/react";

import {
  helloWorldGetHelloResponseSchema,
  helloWorldRoutes,
  type HelloWorldGetHelloResponse
} from "@repo/hello-world-shared";

import { loadRuntimeConfig, type RuntimeConfig } from "../config";

let cachedConfig: RuntimeConfig | null = null;
let configPromise: Promise<RuntimeConfig> | null = null;

const getRuntimeConfig = async () => {
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
};

const dynamicBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const config = await getRuntimeConfig();
  const rawBaseQuery = fetchBaseQuery({ baseUrl: config.apiBaseUrl });

  return rawBaseQuery(args, api, extraOptions);
};

export const helloApi = createApi({
  reducerPath: "helloApi",
  baseQuery: dynamicBaseQuery,
  endpoints: (builder) => ({
    getHello: builder.query<HelloWorldGetHelloResponse, void>({
      query: () => ({
        url: helloWorldRoutes.getHello.path,
        method: helloWorldRoutes.getHello.method,
        body: {}
      }),
      transformResponse: (response: unknown) =>
        helloWorldGetHelloResponseSchema.parse(response)
    })
  })
});

export const { useGetHelloQuery } = helloApi;
