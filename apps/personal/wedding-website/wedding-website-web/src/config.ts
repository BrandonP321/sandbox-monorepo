import {
  resolveApiBaseUrl,
  type FrontendApiConfigEnv
} from "@repo/frontend-config";

const DEFAULT_WEDDING_API_BASE_URL = "http://localhost:3001";
const NO_STAGED_API_URLS: Readonly<Record<never, string>> = {};

type WeddingWebsiteRuntimeConfig = {
  apiBaseUrl: string;
};

function loadRuntimeConfig(
  env: FrontendApiConfigEnv = import.meta.env
): WeddingWebsiteRuntimeConfig {
  return {
    apiBaseUrl: resolveApiBaseUrl({
      env,
      apiBaseUrlByStage: NO_STAGED_API_URLS,
      defaultApiBaseUrl: DEFAULT_WEDDING_API_BASE_URL
    })
  };
}

export {
  DEFAULT_WEDDING_API_BASE_URL,
  loadRuntimeConfig,
  type WeddingWebsiteRuntimeConfig
};
