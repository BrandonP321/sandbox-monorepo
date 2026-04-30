import { RDSDataClient } from "@aws-sdk/client-rds-data";
import {
  drizzle as drizzleAwsDataApi,
  type AwsDataApiPgDatabase
} from "drizzle-orm/aws-data-api/pg";

import {
  getDeployedDataApiDatabaseConfig,
  type SignalTrackerDatabaseConfig
} from "./config";
import { signalTrackerSchema } from "./schema";

export type SignalTrackerDb = AwsDataApiPgDatabase<typeof signalTrackerSchema>;

type Env = Record<string, string | undefined>;

let runtimeDatabase: SignalTrackerDb | undefined;

export function getRuntimeDatabase(env: Env = process.env): SignalTrackerDb {
  runtimeDatabase ??= createSignalTrackerDatabase(
    getRuntimeDatabaseConfig(env)
  );

  return runtimeDatabase;
}

function createSignalTrackerDatabase(
  config: SignalTrackerDatabaseConfig
): SignalTrackerDb {
  const client = new RDSDataClient({ region: config.region });

  return drizzleAwsDataApi(client, {
    database: config.databaseName,
    resourceArn: config.resourceArn,
    secretArn: config.secretArn,
    schema: signalTrackerSchema
  });
}

function getRuntimeDatabaseConfig(
  env: Env = process.env
): SignalTrackerDatabaseConfig {
  return getDeployedDataApiDatabaseConfig(env);
}
