import type {
  GetCommandInput,
  TransactWriteCommandInput
} from "@aws-sdk/lib-dynamodb";
import { describe, expect, it } from "vitest";

import { rsvpSchemaVersion } from "@repo/wedding-website-shared";

import {
  DynamoDbRsvpSubmissionRepository,
  type RsvpDynamoDbClient
} from "./dynamodb-rsvp-repository.js";
import {
  RsvpPersistenceUnavailableError,
  type RsvpSubmissionRecord,
  type StoreRsvpSubmissionInput
} from "./rsvp-repository.js";

const rawAttemptKey = "7ad1a5a8-8e35-4d9d-99b0-21181700cb95";
const idempotencyKeyHash = "hashed-attempt-key";
const requestHash = "hashed-request";

function submission(
  id = "3bb32b27-c576-4c70-8078-1285efcc908c"
): RsvpSubmissionRecord {
  return {
    submissionId: id,
    submittedAt: "2026-08-25T18:42:31.000Z",
    schemaVersion: rsvpSchemaVersion,
    guestSide: "niamh",
    adults: [
      {
        name: "Example Guest",
        attendance: "attending",
        contact: { email: "guest@example.test" }
      },
      {
        name: "Example Companion",
        attendance: "not-sure",
        contact: { phone: "+1 202 555 0148" }
      }
    ],
    childrenAttending: 1,
    contact: { email: "party@example.test" },
    dietaryOrAllergyNotes: "Vegetarian",
    accessibilityNotes: "Step-free access",
    generalNote: "Thank you"
  };
}

function storeInput(
  overrides: Partial<StoreRsvpSubmissionInput> = {}
): StoreRsvpSubmissionInput {
  return {
    idempotencyKeyHash,
    requestHash,
    submission: submission(),
    ...overrides
  };
}

class FakeRsvpDynamoDbClient implements RsvpDynamoDbClient {
  readonly getInputs: GetCommandInput[] = [];
  readonly transactionInputs: TransactWriteCommandInput[] = [];
  getError?: unknown;
  getItem?: Record<string, unknown>;
  transactionError?: unknown;

  async transactWrite(input: TransactWriteCommandInput): Promise<void> {
    this.transactionInputs.push(structuredClone(input));
    if (this.transactionError) {
      throw this.transactionError;
    }
  }

  async get(
    input: GetCommandInput
  ): Promise<Record<string, unknown> | undefined> {
    this.getInputs.push(structuredClone(input));
    if (this.getError) {
      throw this.getError;
    }
    return structuredClone(this.getItem);
  }
}

function repository(client: RsvpDynamoDbClient, tableName = "rsvp-table") {
  return new DynamoDbRsvpSubmissionRepository({ client, tableName });
}

function transactionCanceledError() {
  return { name: "TransactionCanceledException" };
}

function existingIdempotencyItem(
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    pk: `IDEMPOTENCY#${idempotencyKeyHash}`,
    itemType: "RSVP_IDEMPOTENCY",
    requestHash,
    submissionId: "3bb32b27-c576-4c70-8078-1285efcc908c",
    submittedAt: "2026-08-25T18:42:31.000Z",
    schemaVersion: 1,
    ...overrides
  };
}

describe("DynamoDbRsvpSubmissionRepository", () => {
  it("atomically writes the exact submission and idempotency items", async () => {
    const client = new FakeRsvpDynamoDbClient();
    const input = storeInput();

    const result = await repository(client).createOrReplay(input);

    expect(result).toEqual({
      kind: "created",
      result: {
        submissionId: input.submission.submissionId,
        submittedAt: input.submission.submittedAt,
        schemaVersion: 1
      }
    });
    expect(client.transactionInputs).toEqual([
      {
        TransactItems: [
          {
            Put: {
              TableName: "rsvp-table",
              Item: {
                pk: `SUBMISSION#${input.submission.submissionId}`,
                itemType: "RSVP_SUBMISSION",
                ...input.submission
              },
              ConditionExpression: "attribute_not_exists(pk)"
            }
          },
          {
            Put: {
              TableName: "rsvp-table",
              Item: {
                pk: `IDEMPOTENCY#${idempotencyKeyHash}`,
                itemType: "RSVP_IDEMPOTENCY",
                requestHash,
                submissionId: input.submission.submissionId,
                submittedAt: input.submission.submittedAt,
                schemaVersion: 1
              },
              ConditionExpression: "attribute_not_exists(pk)"
            }
          }
        ]
      }
    ]);
    expect(JSON.stringify(client.transactionInputs)).not.toContain(
      rawAttemptKey
    );
  });

  it("strongly reads and replays the original result after cancellation", async () => {
    const client = new FakeRsvpDynamoDbClient();
    client.transactionError = transactionCanceledError();
    client.getItem = existingIdempotencyItem();

    const result = await repository(client).createOrReplay(
      storeInput({
        submission: submission("a7b606b8-e5d0-40a7-a023-f3597f1b1aa9")
      })
    );

    expect(result).toEqual({
      kind: "replayed",
      result: {
        submissionId: "3bb32b27-c576-4c70-8078-1285efcc908c",
        submittedAt: "2026-08-25T18:42:31.000Z",
        schemaVersion: 1
      }
    });
    expect(client.getInputs).toEqual([
      {
        TableName: "rsvp-table",
        Key: { pk: `IDEMPOTENCY#${idempotencyKeyHash}` },
        ConsistentRead: true
      }
    ]);
  });

  it("returns conflict when a canceled attempt has a changed request hash", async () => {
    const client = new FakeRsvpDynamoDbClient();
    client.transactionError = transactionCanceledError();
    client.getItem = existingIdempotencyItem();

    await expect(
      repository(client).createOrReplay(
        storeInput({ requestHash: "changed-request-hash" })
      )
    ).resolves.toEqual({ kind: "conflict" });
  });

  it("allows identical guest data under distinct attempt identities", async () => {
    const client = new FakeRsvpDynamoDbClient();
    const target = repository(client);

    await target.createOrReplay(storeInput());
    await target.createOrReplay(
      storeInput({
        idempotencyKeyHash: "second-key-hash",
        submission: submission("a7b606b8-e5d0-40a7-a023-f3597f1b1aa9")
      })
    );

    expect(client.transactionInputs).toHaveLength(2);
    expect(
      client.transactionInputs.map(
        (input) => input.TransactItems?.[1]?.Put?.Item?.pk
      )
    ).toEqual([
      `IDEMPOTENCY#${idempotencyKeyHash}`,
      "IDEMPOTENCY#second-key-hash"
    ]);
  });

  it.each([
    ["a submission-ID collision and no replay item", undefined],
    ["malformed replay item", existingIdempotencyItem({ schemaVersion: 2 })]
  ])(
    "maps a canceled transaction with %s to unavailable",
    async (_label, item) => {
      const client = new FakeRsvpDynamoDbClient();
      client.transactionError = transactionCanceledError();
      client.getItem = item;

      await expect(
        repository(client).createOrReplay(storeInput())
      ).rejects.toBeInstanceOf(RsvpPersistenceUnavailableError);
    }
  );

  it("maps transaction and replay-read failures to unavailable", async () => {
    const writeFailure = new FakeRsvpDynamoDbClient();
    writeFailure.transactionError = new Error(
      "database contained guest@example.test"
    );

    await expect(
      repository(writeFailure).createOrReplay(storeInput())
    ).rejects.toBeInstanceOf(RsvpPersistenceUnavailableError);

    const readFailure = new FakeRsvpDynamoDbClient();
    readFailure.transactionError = transactionCanceledError();
    readFailure.getError = new Error("read failed");

    await expect(
      repository(readFailure).createOrReplay(storeInput())
    ).rejects.toBeInstanceOf(RsvpPersistenceUnavailableError);
  });

  it("fails closed before calling AWS when the table name is missing", async () => {
    const client = new FakeRsvpDynamoDbClient();

    await expect(
      repository(client, "  ").createOrReplay(storeInput())
    ).rejects.toBeInstanceOf(RsvpPersistenceUnavailableError);
    expect(client.transactionInputs).toHaveLength(0);
    expect(client.getInputs).toHaveLength(0);
  });
});
