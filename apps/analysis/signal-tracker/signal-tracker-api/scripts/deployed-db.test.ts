import type { ExecuteStatementCommandOutput } from "@aws-sdk/client-rds-data";
import { describe, expect, it, vi } from "vitest";

import {
  AURORA_WAKE_RETRY_DELAYS_MS,
  formatDeployedDbError,
  formatMigrationLedgerRows,
  isAuroraResumeError,
  parseMigrationLedgerRows,
  runWithAuroraWakeRetry
} from "./deployed-db";

describe("deployed DB runner helpers", () => {
  it("classifies Aurora resume errors as retryable", () => {
    expect(
      isAuroraResumeError({
        name: "DatabaseResumingException",
        message: "cluster is waking"
      })
    ).toBe(true);

    expect(
      isAuroraResumeError({
        name: "DrizzleQueryError",
        message: "Failed query",
        cause: {
          name: "DatabaseErrorException",
          message:
            "DatabaseResumingException: The Aurora DB instance is resuming after being auto-paused."
        }
      })
    ).toBe(true);
  });

  it("does not classify ordinary database errors as retryable", () => {
    expect(
      isAuroraResumeError({
        name: "DatabaseErrorException",
        message: 'ERROR: relation "topics" already exists; SQLState: 42P07'
      })
    ).toBe(false);
  });

  it("retries Aurora resume errors through the configured final attempt", async () => {
    const sleep = vi.fn<(delayMs: number) => Promise<void>>(() =>
      Promise.resolve()
    );
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce({
        name: "DatabaseResumingException",
        message: "resuming"
      })
      .mockRejectedValueOnce({
        name: "DatabaseResumingException",
        message: "resuming"
      })
      .mockResolvedValue("ok");

    await expect(
      runWithAuroraWakeRetry({
        phase: "preflight",
        operation,
        sleep,
        retryDelaysMs: [1, 2]
      })
    ).resolves.toBe("ok");

    expect(operation).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenNthCalledWith(1, 1);
    expect(sleep).toHaveBeenNthCalledWith(2, 2);
  });

  it("stops retrying after the final Aurora resume attempt", async () => {
    const operation = vi.fn<() => Promise<void>>().mockRejectedValue({
      name: "DatabaseResumingException",
      message: "resuming"
    });

    await expect(
      runWithAuroraWakeRetry({
        phase: "migration",
        operation,
        sleep: () => Promise.resolve(),
        retryDelaysMs: [1, 2]
      })
    ).rejects.toMatchObject({
      name: "DatabaseResumingException",
      message: "resuming"
    });

    expect(operation).toHaveBeenCalledTimes(3);
  });

  it("uses the documented Aurora wake retry schedule", () => {
    expect(AURORA_WAKE_RETRY_DELAYS_MS).toEqual([
      2_000, 5_000, 10_000, 15_000, 20_000, 30_000, 30_000
    ]);
  });

  it("does not retry ordinary database errors and preserves details", async () => {
    const error = {
      name: "DatabaseErrorException",
      message: 'ERROR: relation "topics" already exists; SQLState: 42P07',
      $metadata: {
        requestId: "request-123"
      }
    };
    const operation = vi.fn<() => Promise<void>>().mockRejectedValue(error);

    await expect(
      runWithAuroraWakeRetry({
        phase: "migration",
        operation,
        sleep: () => Promise.resolve()
      })
    ).rejects.toBe(error);

    expect(operation).toHaveBeenCalledTimes(1);
    expect(formatDeployedDbError(error)).toContain(
      "phase=migration name=DatabaseErrorException sqlState=42P07 requestId=request-123"
    );
  });

  it("formats nested cause details", () => {
    const formatted = formatDeployedDbError({
      name: "DrizzleQueryError",
      message: "Failed query",
      cause: {
        name: "DatabaseErrorException",
        message: 'ERROR: relation "topics" already exists; SQLState: 42P07',
        $metadata: {
          requestId: "request-123"
        }
      }
    });

    expect(formatted).toContain("name=DrizzleQueryError");
    expect(formatted).toContain(
      "name=DatabaseErrorException sqlState=42P07 requestId=request-123"
    );
  });
});

describe("deployed DB verification helpers", () => {
  it("parses representative Data API migration ledger records", () => {
    const result: ExecuteStatementCommandOutput = {
      $metadata: {},
      records: [
        [
          { longValue: 1 },
          {
            stringValue:
              "27b175cf234498f511b8d7cab849000d66a3062b4046486e5423461dbccabc8b"
          },
          { longValue: 1777301698141 }
        ]
      ]
    };

    expect(parseMigrationLedgerRows(result)).toEqual([
      {
        id: 1,
        hash: "27b175cf234498f511b8d7cab849000d66a3062b4046486e5423461dbccabc8b",
        createdAt: 1777301698141
      }
    ]);
  });

  it("formats migration ledger rows for console verification", () => {
    expect(
      formatMigrationLedgerRows([
        {
          id: 1,
          hash: "abc123",
          createdAt: 1777301698141
        }
      ])
    ).toBe("- id=1 created_at=1777301698141 hash=abc123");
  });

  it("formats an empty migration ledger clearly", () => {
    expect(formatMigrationLedgerRows([])).toBe(
      "No deployed migrations are recorded."
    );
  });
});
