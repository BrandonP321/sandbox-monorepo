export type FrontendApiConfigEnv = {
  readonly [key: string]: unknown;
  readonly VITE_API_BASE_URL?: unknown;
  readonly VITE_API_STAGE?: unknown;
};

export type ResolveApiBaseUrlOptions<TStage extends string> = {
  readonly env: FrontendApiConfigEnv;
  readonly apiBaseUrlByStage: Readonly<Record<TStage, string>>;
  readonly defaultApiBaseUrl?: string;
};

const DEFAULT_API_BASE_URL = "http://localhost:3001";

export function resolveApiBaseUrl<TStage extends string>({
  env,
  apiBaseUrlByStage,
  defaultApiBaseUrl = DEFAULT_API_BASE_URL
}: ResolveApiBaseUrlOptions<TStage>): string {
  const explicitApiBaseUrl = readPresentEnv(env.VITE_API_BASE_URL);
  if (explicitApiBaseUrl) {
    return explicitApiBaseUrl;
  }

  const apiStage = readPresentEnv(env.VITE_API_STAGE);
  if (apiStage) {
    if (isSupportedApiStage(apiStage, apiBaseUrlByStage)) {
      return apiBaseUrlByStage[apiStage];
    }

    throw new Error(
      `Unsupported VITE_API_STAGE: ${apiStage}. Supported stages: ${Object.keys(
        apiBaseUrlByStage
      ).join(", ")}`
    );
  }

  return defaultApiBaseUrl;
}

function readPresentEnv(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed || undefined;
}

function isSupportedApiStage<TStage extends string>(
  stage: string,
  apiBaseUrlByStage: Readonly<Record<TStage, string>>
): stage is TStage {
  return stage in apiBaseUrlByStage;
}
