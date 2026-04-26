import type { z } from "zod";

export type PostmanRouteSpec = {
  method: string;
  path: `/${string}`;
};

export type PostmanVariableType = "any" | "default" | "secret";

export type PostmanEnvironmentVariable = {
  value: string;
  type?: PostmanVariableType;
  enabled?: boolean;
  description?: string;
};

export type PostmanEnvironmentConfig = {
  name: string;
  values: Record<string, PostmanEnvironmentVariable>;
};

export type PostmanProjectConfig = {
  projectSlug: string;
  displayName: string;
  apiPackageName?: string;
  postman: {
    workspaceName: string;
    collectionName: string;
  };
  routes?: Record<string, PostmanRouteSpec>;
  requestConfigGlobs: string[];
  environments: Record<string, PostmanEnvironmentConfig>;
};

type ExampleBody<TSchema> = TSchema extends z.ZodTypeAny
  ? z.input<TSchema>
  : unknown;

export type PostmanRequestConfig<
  TRequestSchema extends z.ZodTypeAny | undefined = undefined
> = {
  routeName: string;
  route: PostmanRouteSpec;
  folder?: string;
  name: string;
  description?: string;
  requestSchema?: TRequestSchema;
  exampleBody?: ExampleBody<TRequestSchema>;
};

export type LoadedPostmanProject = {
  config: PostmanProjectConfig;
  configPath: string;
  projectRoot: string;
};

export type LoadedPostmanRequest = {
  config: PostmanRequestConfig<z.ZodTypeAny | undefined>;
  configPath: string;
};

export type GeneratedPostmanArtifacts = {
  collection: PostmanCollection;
  environments: Record<string, PostmanEnvironmentFile>;
};

export type PostmanCollection = {
  info: {
    name: string;
    description?: string;
    schema: string;
  };
  item: PostmanCollectionItem[];
  variable?: Array<{ key: string; value: string }>;
};

export type PostmanCollectionItem =
  | {
      name: string;
      item: PostmanRequestItem[];
    }
  | PostmanRequestItem;

export type PostmanRequestItem = {
  name: string;
  request: {
    method: string;
    header?: Array<{ key: string; value: string }>;
    url: {
      raw: string;
      host: string[];
      path: string[];
    };
    body?: {
      mode: "raw";
      raw: string;
      options: {
        raw: {
          language: "json";
        };
      };
    };
    description?: string;
  };
  response?: [];
};

export type PostmanEnvironmentFile = {
  name: string;
  values: Array<{
    key: string;
    value: string;
    enabled: boolean;
    type: PostmanVariableType;
    description?: string;
  }>;
};

export type PostmanState = {
  collectionUid: string | null;
  environments: Record<string, { uid: string }>;
};
