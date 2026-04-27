import { RDSDataClient } from "@aws-sdk/client-rds-data";
import {
  drizzle as drizzleAwsDataApi,
  type AwsDataApiPgDatabase
} from "drizzle-orm/aws-data-api/pg";
import {
  drizzle as drizzleNodePostgres,
  type NodePgDatabase
} from "drizzle-orm/node-postgres";

import {
  getDeployedDataApiDatabaseConfig,
  getLocalDatabaseConfig,
  type SignalTrackerDatabaseConfig
} from "./config";
import { signalTrackerSchema } from "./schema";

export type SignalTrackerDb =
  | AwsDataApiPgDatabase<typeof signalTrackerSchema>
  | NodePgDatabase<typeof signalTrackerSchema>;

type Env = Record<string, string | undefined>;

let runtimeDatabase: SignalTrackerDb | undefined;

export function getRuntimeDatabase(env: Env = process.env): SignalTrackerDb {
  runtimeDatabase ??= createSignalTrackerDatabase(
    getRuntimeDatabaseConfig(env)
  );

  return runtimeDatabase;
}

export function createSignalTrackerDatabase(
  config: SignalTrackerDatabaseConfig
): SignalTrackerDb {
  if (config.mode === "local") {
    return drizzleNodePostgres(config.databaseUrl, {
      schema: signalTrackerSchema
    });
  }

  const client = new RDSDataClient({ region: config.region });

  return drizzleAwsDataApi(client, {
    database: config.databaseName,
    resourceArn: config.resourceArn,
    secretArn: config.secretArn,
    schema: signalTrackerSchema
  });
}

export function getRuntimeDatabaseConfig(
  env: Env = process.env
): SignalTrackerDatabaseConfig {
  if (hasAnyDeployedDataApiConfig(env)) {
    return getDeployedDataApiDatabaseConfig(env);
  }

  return getLocalDatabaseConfig(env);
}

function hasAnyDeployedDataApiConfig(env: Env): boolean {
  return [
    env.SIGNAL_TRACKER_DB_NAME,
    env.SIGNAL_TRACKER_DB_RESOURCE_ARN,
    env.SIGNAL_TRACKER_DB_SECRET_ARN
  ].some((value) => Boolean(value?.trim()));
}
