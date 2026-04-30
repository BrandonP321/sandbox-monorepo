import {
  RDSDataClient,
  ExecuteStatementCommand
} from "@aws-sdk/client-rds-data";

import { getDeployedDataApiDatabaseConfig } from "../src/db/config";

async function main() {
  const config = getDeployedDataApiDatabaseConfig();
  const client = new RDSDataClient({ region: config.region });

  const result = await client.send(
    new ExecuteStatementCommand({
      database: config.databaseName,
      resourceArn: config.resourceArn,
      secretArn: config.secretArn,
      sql: "select 1 as ok"
    })
  );

  console.log(
    JSON.stringify({ ok: result.records?.[0]?.[0]?.longValue === 1 })
  );
}

void main();
