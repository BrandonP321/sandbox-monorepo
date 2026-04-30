import type { z } from "zod";

import type { PostmanProjectConfig, PostmanRequestConfig } from "./types.js";

export type {
  GeneratedPostmanArtifacts,
  LoadedPostmanProject,
  LoadedPostmanRequest,
  PostmanCollection,
  PostmanEnvironmentConfig,
  PostmanEnvironmentFile,
  PostmanEnvironmentVariable,
  PostmanProjectConfig,
  PostmanRequestConfig,
  PostmanRouteSpec,
  PostmanState,
  PostmanVariableType
} from "./types.js";

export function definePostmanProject<TConfig extends PostmanProjectConfig>(
  config: TConfig
): TConfig {
  return config;
}

export function definePostmanRequest<
  TRequestSchema extends z.ZodTypeAny | undefined = undefined
>(
  config: PostmanRequestConfig<TRequestSchema>
): PostmanRequestConfig<TRequestSchema> {
  return config;
}
