import { resolveApiBaseUrl } from "@repo/frontend-config";

export type RuntimeConfig = {
  apiBaseUrl: string;
};

const DEFAULT_API_URL = "http://localhost:3001";

const API_BASE_URL_BY_STAGE = {
  // TODO: Add dev when Hello World has a distinct deployed dev API.
  prod: "https://8nq5tlumrg.execute-api.us-east-1.amazonaws.com"
} as const;

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  return {
    apiBaseUrl: resolveApiBaseUrl({
      env: import.meta.env,
      apiBaseUrlByStage: API_BASE_URL_BY_STAGE,
      defaultApiBaseUrl: DEFAULT_API_URL
    })
  };
}
