export type DeployedDataApiDatabaseConfig = {
  readonly mode: "deployed-data-api";
  readonly stage: SignalTrackerDatabaseStage | "custom";
  readonly databaseName: string;
  readonly resourceArn: string;
  readonly secretArn: string;
  readonly region: string;
};

export type SignalTrackerDatabaseConfig = DeployedDataApiDatabaseConfig;
export type SignalTrackerDatabaseStage = keyof typeof DATABASE_CONFIG_BY_STAGE;

type Env = Record<string, string | undefined>;

const DEFAULT_AWS_REGION = "us-east-1";
const DEFAULT_DATABASE_STAGE = "prod";

const DATABASE_CONFIG_BY_STAGE = {
  // TODO: Add a dev stage here when the separate dev Aurora database exists.
  prod: {
    databaseName: "signal_tracker",
    resourceArn:
      "arn:aws:rds:us-east-1:498283327683:cluster:signaltrackerstack-signaltrackerdatabaseclusteraae-tjougyjlsobx",
    secretArn:
      "arn:aws:secretsmanager:us-east-1:498283327683:secret:SignalTrackerStackSignalTra-Nci0sG1DMu6e-aILyNc",
    region: "us-east-1"
  }
} as const;

export function getDeployedDataApiDatabaseConfig(
  env: Env = process.env
): DeployedDataApiDatabaseConfig {
  if (hasAnyExplicitDeployedDataApiConfig(env)) {
    return {
      mode: "deployed-data-api",
      stage: "custom",
      databaseName: requireEnv(env, "SIGNAL_TRACKER_DB_NAME"),
      resourceArn: requireEnv(env, "SIGNAL_TRACKER_DB_RESOURCE_ARN"),
      secretArn: requireEnv(env, "SIGNAL_TRACKER_DB_SECRET_ARN"),
      region:
        firstPresent(env.AWS_REGION, env.AWS_DEFAULT_REGION) ??
        DEFAULT_AWS_REGION
    };
  }

  return getDatabaseConfigForStage(readDatabaseStage(env));
}

export function readDatabaseStage(
  env: Env = process.env
): SignalTrackerDatabaseStage {
  const stage =
    firstPresent(env.SIGNAL_TRACKER_DB_STAGE) ?? DEFAULT_DATABASE_STAGE;

  if (isSignalTrackerDatabaseStage(stage)) {
    return stage;
  }

  throw new Error(
    `Unsupported SIGNAL_TRACKER_DB_STAGE: ${stage}. Supported stages: ${Object.keys(
      DATABASE_CONFIG_BY_STAGE
    ).join(", ")}`
  );
}

export function getDatabaseConfigForStage(
  stage: SignalTrackerDatabaseStage
): DeployedDataApiDatabaseConfig {
  const stageConfig = DATABASE_CONFIG_BY_STAGE[stage];

  return {
    mode: "deployed-data-api",
    stage,
    ...stageConfig
  };
}

function requireEnv(env: Env, key: string): string {
  const value = env[key]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function hasAnyExplicitDeployedDataApiConfig(env: Env): boolean {
  return [
    env.SIGNAL_TRACKER_DB_NAME,
    env.SIGNAL_TRACKER_DB_RESOURCE_ARN,
    env.SIGNAL_TRACKER_DB_SECRET_ARN
  ].some((value) => Boolean(value?.trim()));
}

function isSignalTrackerDatabaseStage(
  stage: string
): stage is SignalTrackerDatabaseStage {
  return stage in DATABASE_CONFIG_BY_STAGE;
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
