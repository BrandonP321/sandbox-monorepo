import { RDSDataClient } from "@aws-sdk/client-rds-data";

import { getDeployedDataApiDatabaseConfig } from "../src/db/config";
import {
  formatDeployedDbError,
  formatMigrationLedgerRows,
  readDeployedMigrationLedger
} from "./deployed-db";

async function main() {
  try {
    const config = getDeployedDataApiDatabaseConfig();
    const client = new RDSDataClient({ region: config.region });

    const rows = await readDeployedMigrationLedger(client, config);
    console.log(
      `Verified deployed migration ledger for database=${config.databaseName} region=${config.region}`
    );
    console.log(formatMigrationLedgerRows(rows));
  } catch (error) {
    console.error(formatDeployedDbError(error));
    process.exitCode = 1;
  }
}

void main();
