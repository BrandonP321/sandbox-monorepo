import { RDSDataClient } from "@aws-sdk/client-rds-data";

import { getDeployedDataApiDatabaseConfig } from "../src/db/config";
import { formatDeployedDbError, runDeployedMigrations } from "./deployed-db";

async function main() {
  try {
    const config = getDeployedDataApiDatabaseConfig();
    const client = new RDSDataClient({ region: config.region });

    console.log(
      `Running deployed migrations for database=${config.databaseName} region=${config.region}`
    );
    await runDeployedMigrations(client, config, { log: console.log });
    console.log("Deployed migrations applied successfully.");
  } catch (error) {
    console.error(formatDeployedDbError(error));
    process.exitCode = 1;
  }
}

void main();
