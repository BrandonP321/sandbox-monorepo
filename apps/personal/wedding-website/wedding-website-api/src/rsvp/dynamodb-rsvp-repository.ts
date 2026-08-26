import type {
  GetCommandInput,
  GetCommandOutput,
  TransactWriteCommandInput
} from "@aws-sdk/lib-dynamodb";
import { GetCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import {
  createRsvpSubmissionResponseSchema,
  type CreateRsvpSubmissionRequest,
  type CreateRsvpSubmissionResponse
} from "@repo/wedding-website-shared";
import type { Logger } from "@repo/api-core";

import {
  RsvpPersistenceUnavailableError,
  type RsvpSubmissionRepository,
  type StoreRsvpSubmissionInput,
  type StoreRsvpSubmissionResult
} from "./rsvp-repository.js";

export type RsvpSubmissionItemV1 = CreateRsvpSubmissionRequest &
  CreateRsvpSubmissionResponse & {
    pk: `SUBMISSION#${string}`;
    itemType: "RSVP_SUBMISSION";
  };

export type RsvpIdempotencyItemV1 = CreateRsvpSubmissionResponse & {
  pk: `IDEMPOTENCY#${string}`;
  itemType: "RSVP_IDEMPOTENCY";
  requestHash: string;
};

export interface RsvpDynamoDbClient {
  transactWrite(input: TransactWriteCommandInput): Promise<void>;
  get(input: GetCommandInput): Promise<Record<string, unknown> | undefined>;
}

export class AwsRsvpDynamoDbClient implements RsvpDynamoDbClient {
  constructor(private readonly documentClient: DynamoDBDocumentClient) {}

  async transactWrite(input: TransactWriteCommandInput): Promise<void> {
    await this.documentClient.send(new TransactWriteCommand(input));
  }

  async get(
    input: GetCommandInput
  ): Promise<Record<string, unknown> | undefined> {
    const output: GetCommandOutput = await this.documentClient.send(
      new GetCommand(input)
    );
    return output.Item as Record<string, unknown> | undefined;
  }
}

export type DynamoDbRsvpSubmissionRepositoryOptions = {
  client: RsvpDynamoDbClient;
  logger?: Logger;
  tableName: string;
};

export class DynamoDbRsvpSubmissionRepository implements RsvpSubmissionRepository {
  readonly #client: RsvpDynamoDbClient;
  readonly #logger: Logger;
  readonly #tableName: string;

  constructor(options: DynamoDbRsvpSubmissionRepositoryOptions) {
    this.#client = options.client;
    this.#logger = options.logger ?? (() => undefined);
    this.#tableName = options.tableName.trim();
  }

  async createOrReplay(
    input: StoreRsvpSubmissionInput
  ): Promise<StoreRsvpSubmissionResult> {
    if (!this.#tableName) {
      throw new RsvpPersistenceUnavailableError();
    }

    const submissionItem = toSubmissionItem(input);
    const idempotencyItem = toIdempotencyItem(input);

    try {
      await this.#client.transactWrite({
        TransactItems: [
          {
            Put: {
              TableName: this.#tableName,
              Item: submissionItem,
              ConditionExpression: "attribute_not_exists(pk)"
            }
          },
          {
            Put: {
              TableName: this.#tableName,
              Item: idempotencyItem,
              ConditionExpression: "attribute_not_exists(pk)"
            }
          }
        ]
      });
    } catch (error) {
      if (!isTransactionCanceledError(error)) {
        logPersistenceError(this.#logger, "transact_write", error);
        throw new RsvpPersistenceUnavailableError();
      }

      try {
        return await this.reconcileCanceledTransaction(input);
      } catch (reconcileError) {
        logPersistenceError(this.#logger, "transact_write", error);
        throw reconcileError;
      }
    }

    return {
      kind: "created",
      result: toSubmissionResult(input.submission)
    };
  }

  private async reconcileCanceledTransaction(
    input: StoreRsvpSubmissionInput
  ): Promise<StoreRsvpSubmissionResult> {
    const pk = idempotencyPk(input.idempotencyKeyHash);

    let item: Record<string, unknown> | undefined;
    try {
      item = await this.#client.get({
        TableName: this.#tableName,
        Key: { pk },
        ConsistentRead: true
      });
    } catch (error) {
      logPersistenceError(this.#logger, "replay_get", error);
      throw new RsvpPersistenceUnavailableError();
    }

    const existing = parseIdempotencyItem(item, pk);
    if (!existing) {
      throw new RsvpPersistenceUnavailableError();
    }

    if (existing.requestHash !== input.requestHash) {
      return { kind: "conflict" };
    }

    return {
      kind: "replayed",
      result: toSubmissionResult(existing)
    };
  }
}

function toSubmissionItem(
  input: StoreRsvpSubmissionInput
): RsvpSubmissionItemV1 {
  return {
    pk: `SUBMISSION#${input.submission.submissionId}`,
    itemType: "RSVP_SUBMISSION",
    ...structuredClone(input.submission)
  };
}

function toIdempotencyItem(
  input: StoreRsvpSubmissionInput
): RsvpIdempotencyItemV1 {
  return {
    pk: idempotencyPk(input.idempotencyKeyHash),
    itemType: "RSVP_IDEMPOTENCY",
    requestHash: input.requestHash,
    ...toSubmissionResult(input.submission)
  };
}

function idempotencyPk(hash: string): `IDEMPOTENCY#${string}` {
  return `IDEMPOTENCY#${hash}`;
}

function parseIdempotencyItem(
  item: Record<string, unknown> | undefined,
  expectedPk: string
): RsvpIdempotencyItemV1 | undefined {
  if (!item) {
    return undefined;
  }

  if (
    item.pk !== expectedPk ||
    item.itemType !== "RSVP_IDEMPOTENCY" ||
    typeof item.requestHash !== "string"
  ) {
    return undefined;
  }

  const result = createRsvpSubmissionResponseSchema.safeParse({
    submissionId: item.submissionId,
    submittedAt: item.submittedAt,
    schemaVersion: item.schemaVersion
  });
  if (!result.success) {
    return undefined;
  }

  return {
    pk: expectedPk as `IDEMPOTENCY#${string}`,
    itemType: "RSVP_IDEMPOTENCY",
    requestHash: item.requestHash,
    ...result.data
  };
}

function toSubmissionResult(
  submission: CreateRsvpSubmissionResponse
): CreateRsvpSubmissionResponse {
  return {
    submissionId: submission.submissionId,
    submittedAt: submission.submittedAt,
    schemaVersion: submission.schemaVersion
  };
}

function isTransactionCanceledError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "TransactionCanceledException"
  );
}

type PersistenceOperation = "replay_get" | "transact_write";

function logPersistenceError(
  logger: Logger,
  operation: PersistenceOperation,
  error: unknown
): void {
  const errorRecord = asRecord(error);
  const metadata = asRecord(errorRecord?.$metadata);
  const errorName = stringValue(errorRecord?.name) ?? "UnknownError";
  const cancellationReasons =
    errorName === "TransactionCanceledException"
      ? safeCancellationReasons(errorRecord?.CancellationReasons)
      : undefined;

  logger({
    level: "error",
    event: "rsvp_persistence_error",
    operation,
    errorName,
    errorClass: safeErrorClass(error),
    fault: stringValue(errorRecord?.$fault),
    httpStatusCode: numberValue(metadata?.httpStatusCode),
    requestId: stringValue(metadata?.requestId),
    extendedRequestId: stringValue(metadata?.extendedRequestId),
    attempts: numberValue(metadata?.attempts),
    totalRetryDelay: numberValue(metadata?.totalRetryDelay),
    ...(cancellationReasons === undefined ? {} : { cancellationReasons })
  });
}

function safeCancellationReasons(
  value: unknown
): { position: number; code: string }[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.flatMap((reason, position) => {
    const code = stringValue(asRecord(reason)?.Code);
    return code === undefined ? [] : [{ position, code }];
  });
}

function safeErrorClass(error: unknown): string | undefined {
  if (!(error instanceof Error)) {
    return undefined;
  }

  return error.constructor.name || undefined;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}
