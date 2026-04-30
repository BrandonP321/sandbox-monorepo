import {
  RDSDataClient,
  ExecuteStatementCommand
} from "@aws-sdk/client-rds-data";

import { getDeployedDataApiDatabaseConfig } from "../src/db/config";
import { formatDeployedDbError, runWithAuroraWakeRetry } from "./deployed-db";

async function main() {
  try {
    const config = getDeployedDataApiDatabaseConfig();
    const client = new RDSDataClient({ region: config.region });

    const result = await runWithAuroraWakeRetry({
      phase: "verification",
      operation: () =>
        client.send(
          new ExecuteStatementCommand({
            database: config.databaseName,
            resourceArn: config.resourceArn,
            secretArn: config.secretArn,
            sql: "select 1 as ok"
          })
        ),
      log: console.log
    });

    console.log(
      JSON.stringify({ ok: result.records?.[0]?.[0]?.longValue === 1 })
    );
  } catch (error) {
    console.error(formatDeployedDbError(error));
    process.exitCode = 1;
  }
}

void main();
