import {
  ExecuteStatementCommand,
  type ExecuteStatementCommandOutput,
  type Field,
  type RDSDataClient
} from "@aws-sdk/client-rds-data";
import { drizzle } from "drizzle-orm/aws-data-api/pg";
import { migrate } from "drizzle-orm/aws-data-api/pg/migrator";

import type { DeployedDataApiDatabaseConfig } from "../src/db/config";

export const DEPLOYED_MIGRATIONS_SCHEMA = "drizzle";
export const DEPLOYED_MIGRATIONS_TABLE = "__drizzle_migrations";
export const AURORA_WAKE_RETRY_DELAYS_MS = [
  2_000,
  5_000,
  10_000,
  15_000,
  20_000,
  30_000,
  30_000
] as const;

export type DeployedMigrationLedgerRow = {
  readonly id: number;
  readonly hash: string;
  readonly createdAt: number;
};

export type DeployedDbPhase =
  | "preflight"
  | "migration"
  | "verification";

type RunnerOptions = {
  readonly log?: (message: string) => void;
};

type RetryOptions<T> = {
  readonly phase: DeployedDbPhase;
  readonly operation: () => Promise<T>;
  readonly sleep?: (delayMs: number) => Promise<void>;
  readonly log?: (message: string) => void;
  readonly retryDelaysMs?: readonly number[];
};

export async function runDeployedMigrations(
  client: RDSDataClient,
  config: DeployedDataApiDatabaseConfig,
  options: RunnerOptions = {}
): Promise<void> {
  await runWithAuroraWakeRetry({
    phase: "preflight",
    operation: () => executeStatement(client, config, "select 1 as ok"),
    log: options.log
  });

  await runWithAuroraWakeRetry({
    phase: "migration",
    operation: async () => {
      const db = drizzle(client, {
        database: config.databaseName,
        resourceArn: config.resourceArn,
        secretArn: config.secretArn
      });

      await migrate(db, {
        migrationsFolder: "./drizzle",
        migrationsSchema: DEPLOYED_MIGRATIONS_SCHEMA,
        migrationsTable: DEPLOYED_MIGRATIONS_TABLE
      });
    },
    log: options.log
  });
}

export async function readDeployedMigrationLedger(
  client: RDSDataClient,
  config: DeployedDataApiDatabaseConfig
): Promise<readonly DeployedMigrationLedgerRow[]> {
  await runWithAuroraWakeRetry({
    phase: "verification",
    operation: () => executeStatement(client, config, "select 1 as ok")
  });

  const result = await runWithAuroraWakeRetry({
    phase: "verification",
    operation: () =>
      executeStatement(
        client,
        config,
        `select id, hash, created_at from ${DEPLOYED_MIGRATIONS_SCHEMA}.${DEPLOYED_MIGRATIONS_TABLE} order by created_at`
      )
  });

  return parseMigrationLedgerRows(result);
}

export async function runWithAuroraWakeRetry<T>({
  phase,
  operation,
  sleep = wait,
  log,
  retryDelaysMs = AURORA_WAKE_RETRY_DELAYS_MS
}: RetryOptions<T>): Promise<T> {
  for (let attemptIndex = 0; ; attemptIndex += 1) {
    try {
      return await operation();
    } catch (error) {
      const delayMs = retryDelaysMs[attemptIndex];

      if (!isAuroraResumeError(error) || delayMs === undefined) {
        throw enrichErrorWithPhase(error, phase);
      }

      log?.(
        `${phase} hit Aurora resume latency; retrying in ${Math.round(
          delayMs / 1_000
        )}s (attempt ${attemptIndex + 2}/${retryDelaysMs.length + 1})`
      );
      await sleep(delayMs);
    }
  }
}

export function isAuroraResumeError(error: unknown): boolean {
  return findErrorInChain(error, (candidate) => {
    const name = getStringProperty(candidate, "name");
    const message = getStringProperty(candidate, "message");

    return (
      name === "DatabaseResumingException" ||
      message.includes("DatabaseResumingException") ||
      message.includes("is resuming after being auto-paused")
    );
  });
}

export function formatMigrationLedgerRows(
  rows: readonly DeployedMigrationLedgerRow[]
): string {
  if (rows.length === 0) {
    return "No deployed migrations are recorded.";
  }

  return rows
    .map(
      (row) =>
        `- id=${row.id} created_at=${row.createdAt} hash=${row.hash}`
    )
    .join("\n");
}

export function formatDeployedDbError(error: unknown): string {
  const details = collectErrorDetails(error);

  return [
    "Deployed database operation failed.",
    ...details.map((detail) => {
      const parts = [
        detail.phase ? `phase=${detail.phase}` : undefined,
        detail.name ? `name=${detail.name}` : undefined,
        detail.sqlState ? `sqlState=${detail.sqlState}` : undefined,
        detail.requestId ? `requestId=${detail.requestId}` : undefined,
        detail.message ? `message=${detail.message}` : undefined
      ].filter((part): part is string => Boolean(part));

      return parts.length > 0 ? `- ${parts.join(" ")}` : "- unknown error";
    })
  ].join("\n");
}

export function parseMigrationLedgerRows(
  result: ExecuteStatementCommandOutput
): readonly DeployedMigrationLedgerRow[] {
  return (
    result.records?.map((record) => ({
      id: requireLong(record[0], "id"),
      hash: requireString(record[1], "hash"),
      createdAt: requireLong(record[2], "created_at")
    })) ?? []
  );
}

function executeStatement(
  client: RDSDataClient,
  config: DeployedDataApiDatabaseConfig,
  sql: string
): Promise<ExecuteStatementCommandOutput> {
  return client.send(
    new ExecuteStatementCommand({
      database: config.databaseName,
      resourceArn: config.resourceArn,
      secretArn: config.secretArn,
      sql
    })
  );
}

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

function enrichErrorWithPhase(
  error: unknown,
  phase: DeployedDbPhase
): unknown {
  if (
    error &&
    typeof error === "object" &&
    !("phase" in error) &&
    Object.isExtensible(error)
  ) {
    Object.defineProperty(error, "phase", {
      value: phase,
      enumerable: false
    });
  }

  return error;
}

type ErrorDetail = {
  readonly phase?: string;
  readonly name?: string;
  readonly message?: string;
  readonly sqlState?: string;
  readonly requestId?: string;
};

function collectErrorDetails(error: unknown): readonly ErrorDetail[] {
  const details: ErrorDetail[] = [];
  let current: unknown = error;

  while (current && typeof current === "object") {
    const message = getStringProperty(current, "message");
    details.push({
      phase: getStringProperty(current, "phase") || undefined,
      name: getStringProperty(current, "name") || undefined,
      message: message || undefined,
      sqlState: findSqlState(message) || undefined,
      requestId: getAwsRequestId(current) || undefined
    });

    current = getUnknownProperty(current, "cause");
  }

  return details.length > 0 ? details : [{}];
}

function findErrorInChain(
  error: unknown,
  predicate: (candidate: object) => boolean
): boolean {
  let current: unknown = error;

  while (current && typeof current === "object") {
    if (predicate(current)) {
      return true;
    }

    current = getUnknownProperty(current, "cause");
  }

  return false;
}

function findSqlState(message: string): string {
  return /SQLState:\s*([A-Z0-9]+)/.exec(message)?.[1] ?? "";
}

function getAwsRequestId(error: object): string {
  const metadata = getUnknownProperty(error, "$metadata");
  if (!metadata || typeof metadata !== "object") {
    return "";
  }

  return getStringProperty(metadata, "requestId");
}

function getStringProperty(value: object, key: string): string {
  const property = getUnknownProperty(value, key);
  return typeof property === "string" ? property : "";
}

function getUnknownProperty(value: object, key: string): unknown {
  return (value as Record<string, unknown>)[key];
}

function requireLong(field: Field | undefined, name: string): number {
  if (typeof field?.longValue !== "number") {
    throw new Error(`Migration ledger field ${name} was not a number`);
  }

  return field.longValue;
}

function requireString(field: Field | undefined, name: string): string {
  if (typeof field?.stringValue !== "string") {
    throw new Error(`Migration ledger field ${name} was not a string`);
  }

  return field.stringValue;
}
