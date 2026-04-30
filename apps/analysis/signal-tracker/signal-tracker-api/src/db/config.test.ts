import { describe, expect, it } from "vitest";

import {
  getDatabaseConfigForStage,
  getDeployedDataApiDatabaseConfig,
  readDatabaseStage
} from "./config";

describe("database config", () => {
  it("defaults to the prod database stage", () => {
    expect(readDatabaseStage({})).toBe("prod");
    expect(getDeployedDataApiDatabaseConfig({})).toEqual(
      getDatabaseConfigForStage("prod")
    );
  });

  it("reads a supported database stage from SIGNAL_TRACKER_DB_STAGE", () => {
    expect(
      readDatabaseStage({
        SIGNAL_TRACKER_DB_STAGE: " prod "
      })
    ).toBe("prod");
    expect(
      getDeployedDataApiDatabaseConfig({
        SIGNAL_TRACKER_DB_STAGE: "prod"
      })
    ).toEqual({
      ...getDatabaseConfigForStage("prod"),
      stage: "prod"
    });
  });

  it("rejects unsupported database stages", () => {
    expect(() =>
      readDatabaseStage({
        SIGNAL_TRACKER_DB_STAGE: "dev"
      })
    ).toThrow("Unsupported SIGNAL_TRACKER_DB_STAGE: dev");
  });

  it("keeps explicit deployed Data API env vars as an override", () => {
    expect(
      getDeployedDataApiDatabaseConfig({
        SIGNAL_TRACKER_DB_NAME: "signal_tracker",
        SIGNAL_TRACKER_DB_RESOURCE_ARN:
          "arn:aws:rds:us-east-1:498283327683:cluster:signal-tracker",
        SIGNAL_TRACKER_DB_SECRET_ARN:
          "arn:aws:secretsmanager:us-east-1:498283327683:secret:signal-tracker",
        AWS_REGION: "us-east-1"
      })
    ).toEqual({
      mode: "deployed-data-api",
      stage: "custom",
      databaseName: "signal_tracker",
      resourceArn: "arn:aws:rds:us-east-1:498283327683:cluster:signal-tracker",
      secretArn:
        "arn:aws:secretsmanager:us-east-1:498283327683:secret:signal-tracker",
      region: "us-east-1"
    });
  });

  it("uses us-east-1 as the explicit Data API default region", () => {
    expect(
      getDeployedDataApiDatabaseConfig({
        SIGNAL_TRACKER_DB_NAME: "signal_tracker",
        SIGNAL_TRACKER_DB_RESOURCE_ARN:
          "arn:aws:rds:us-east-1:498283327683:cluster:signal-tracker",
        SIGNAL_TRACKER_DB_SECRET_ARN:
          "arn:aws:secretsmanager:us-east-1:498283327683:secret:signal-tracker"
      }).region
    ).toBe("us-east-1");
  });

  it("requires a complete explicit deployed Data API override", () => {
    expect(() =>
      getDeployedDataApiDatabaseConfig({
        SIGNAL_TRACKER_DB_NAME: "signal_tracker",
        SIGNAL_TRACKER_DB_RESOURCE_ARN:
          "arn:aws:rds:us-east-1:498283327683:cluster:signal-tracker"
      })
    ).toThrow(
      "Missing required environment variable: SIGNAL_TRACKER_DB_SECRET_ARN"
    );
  });
});
