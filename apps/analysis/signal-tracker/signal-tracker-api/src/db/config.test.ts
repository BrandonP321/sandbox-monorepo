import { describe, expect, it } from "vitest";

import {
  getDeployedDataApiDatabaseConfig,
  getLocalDatabaseConfig
} from "./config";

describe("database config", () => {
  it("reads local PostgreSQL configuration from DATABASE_URL", () => {
    expect(
      getLocalDatabaseConfig({
        DATABASE_URL:
          "postgres://signal_tracker:signal_tracker@localhost:5432/signal_tracker"
      })
    ).toEqual({
      mode: "local",
      databaseUrl:
        "postgres://signal_tracker:signal_tracker@localhost:5432/signal_tracker"
    });
  });

  it("requires DATABASE_URL for local PostgreSQL configuration", () => {
    expect(() => getLocalDatabaseConfig({})).toThrow(
      "Missing required environment variable: DATABASE_URL"
    );
  });

  it("reads deployed Data API configuration from Signal Tracker env vars", () => {
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
      databaseName: "signal_tracker",
      resourceArn: "arn:aws:rds:us-east-1:498283327683:cluster:signal-tracker",
      secretArn:
        "arn:aws:secretsmanager:us-east-1:498283327683:secret:signal-tracker",
      region: "us-east-1"
    });
  });

  it("uses us-east-1 as the deployed Data API default region", () => {
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

  it("requires deployed Data API identifiers", () => {
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
