import type { ScanCommandInput } from "@aws-sdk/lib-dynamodb";
import { describe, expect, it } from "vitest";

import type { AdminRsvpSubmission } from "@repo/wedding-website-shared";

import {
  DynamoDbAdminRsvpRepository,
  type AdminRsvpDynamoDbClient,
  type AdminRsvpScanPage
} from "./dynamodb-admin-rsvp-repository.js";
import { AdminRsvpReadUnavailableError } from "./admin-rsvp-repository.js";

function submission(
  submissionId: string,
  submittedAt: string
): AdminRsvpSubmission {
  return {
    submissionId,
    submittedAt,
    schemaVersion: 1,
    guestSide: "niamh",
    adults: [
      {
        name: "Synthetic Guest",
        attendance: "attending",
        contact: { email: "synthetic@example.test" }
      }
    ],
    childrenAttending: 0,
    contact: { phone: "+1 202 555 0100" }
  };
}

class FakeAdminRsvpDynamoDbClient implements AdminRsvpDynamoDbClient {
  readonly inputs: ScanCommandInput[] = [];
  error?: unknown;
  pages: AdminRsvpScanPage[] = [];

  async scan(input: ScanCommandInput): Promise<AdminRsvpScanPage> {
    this.inputs.push(structuredClone(input));
    if (this.error) {
      throw this.error;
    }
    return structuredClone(this.pages[this.inputs.length - 1] ?? { items: [] });
  }
}

describe("DynamoDbAdminRsvpRepository", () => {
  it("follows every scan page, filters items, validates records, and sorts newest first", async () => {
    const older = submission(
      "3bb32b27-c576-4c70-8078-1285efcc908c",
      "2026-08-25T18:42:31.000Z"
    );
    const newer = submission(
      "a7b606b8-e5d0-40a7-a023-f3597f1b1aa9",
      "2026-08-26T01:35:31.000Z"
    );
    const client = new FakeAdminRsvpDynamoDbClient();
    client.pages = [
      {
        items: [
          {
            pk: `SUBMISSION#${older.submissionId}`,
            itemType: "RSVP_SUBMISSION",
            ...older
          },
          {
            pk: "IDEMPOTENCY#hash",
            itemType: "RSVP_IDEMPOTENCY",
            requestHash: "private-hash"
          },
          {
            pk: "SUBMISSION#malformed",
            itemType: "RSVP_SUBMISSION",
            submissionId: "not-a-uuid"
          }
        ],
        lastEvaluatedKey: { pk: "page-2" }
      },
      {
        items: [
          {
            pk: `SUBMISSION#${newer.submissionId}`,
            itemType: "RSVP_SUBMISSION",
            ...newer
          }
        ]
      }
    ];

    await expect(
      new DynamoDbAdminRsvpRepository({
        client,
        tableName: "rsvp-table"
      }).listSubmissions()
    ).resolves.toEqual([newer, older]);

    expect(client.inputs).toEqual([
      {
        TableName: "rsvp-table",
        FilterExpression: "#itemType = :submissionType",
        ExpressionAttributeNames: { "#itemType": "itemType" },
        ExpressionAttributeValues: { ":submissionType": "RSVP_SUBMISSION" }
      },
      {
        TableName: "rsvp-table",
        FilterExpression: "#itemType = :submissionType",
        ExpressionAttributeNames: { "#itemType": "itemType" },
        ExpressionAttributeValues: { ":submissionType": "RSVP_SUBMISSION" },
        ExclusiveStartKey: { pk: "page-2" }
      }
    ]);
  });

  it("fails safely for missing configuration and DynamoDB read failures", async () => {
    const client = new FakeAdminRsvpDynamoDbClient();

    await expect(
      new DynamoDbAdminRsvpRepository({
        client,
        tableName: ""
      }).listSubmissions()
    ).rejects.toBeInstanceOf(AdminRsvpReadUnavailableError);
    expect(client.inputs).toHaveLength(0);

    client.error = new Error("scan included synthetic@example.test");
    await expect(
      new DynamoDbAdminRsvpRepository({
        client,
        tableName: "rsvp-table"
      }).listSubmissions()
    ).rejects.toBeInstanceOf(AdminRsvpReadUnavailableError);
  });
});
