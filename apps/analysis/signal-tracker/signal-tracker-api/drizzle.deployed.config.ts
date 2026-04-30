import { defineConfig } from "drizzle-kit";

import { getDeployedDataApiDatabaseConfig } from "./src/db/config";

const databaseConfig = getDeployedDataApiDatabaseConfig();

export default defineConfig({
  dialect: "postgresql",
  driver: "aws-data-api",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    database: databaseConfig.databaseName,
    resourceArn: databaseConfig.resourceArn,
    secretArn: databaseConfig.secretArn
  },
  strict: true,
  verbose: true
});
