export type LocalDatabaseConfig = {
  readonly mode: "local";
  readonly databaseUrl: string;
};

export type DeployedDataApiDatabaseConfig = {
  readonly mode: "deployed-data-api";
  readonly databaseName: string;
  readonly resourceArn: string;
  readonly secretArn: string;
  readonly region: string;
};

export type SignalTrackerDatabaseConfig =
  | LocalDatabaseConfig
  | DeployedDataApiDatabaseConfig;

type Env = Record<string, string | undefined>;

const DEFAULT_AWS_REGION = "us-east-1";

export function getLocalDatabaseConfig(
  env: Env = process.env
): LocalDatabaseConfig {
  return {
    mode: "local",
    databaseUrl: requireEnv(env, "DATABASE_URL")
  };
}

export function getDeployedDataApiDatabaseConfig(
  env: Env = process.env
): DeployedDataApiDatabaseConfig {
  return {
    mode: "deployed-data-api",
    databaseName: requireEnv(env, "SIGNAL_TRACKER_DB_NAME"),
    resourceArn: requireEnv(env, "SIGNAL_TRACKER_DB_RESOURCE_ARN"),
    secretArn: requireEnv(env, "SIGNAL_TRACKER_DB_SECRET_ARN"),
    region:
      firstPresent(env.AWS_REGION, env.AWS_DEFAULT_REGION) ?? DEFAULT_AWS_REGION
  };
}

function requireEnv(env: Env, key: string): string {
  const value = env[key]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function firstPresent(
  ...values: Array<string | undefined>
): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return undefined;
}
