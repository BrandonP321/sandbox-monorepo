import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  driver: "aws-data-api",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    database: process.env.SIGNAL_TRACKER_DB_NAME ?? "",
    resourceArn: process.env.SIGNAL_TRACKER_DB_RESOURCE_ARN ?? "",
    secretArn: process.env.SIGNAL_TRACKER_DB_SECRET_ARN ?? ""
  },
  strict: true,
  verbose: true
});
