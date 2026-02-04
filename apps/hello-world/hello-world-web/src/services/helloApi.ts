import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  fetchBaseQuery,
  createApi
} from "@reduxjs/toolkit/query/react";

import { loadRuntimeConfig, type RuntimeConfig } from "../config";

type HelloResponse = {
  message: string;
};

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
    getHello: builder.query<HelloResponse, void>({
      query: () => "/hello"
    })
  })
});

export const { useGetHelloQuery } = helloApi;
