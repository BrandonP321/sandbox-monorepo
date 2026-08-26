import type {
  ScanCommandInput,
  ScanCommandOutput
} from "@aws-sdk/lib-dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import {
  adminRsvpSubmissionSchema,
  type AdminRsvpSubmission
} from "@repo/wedding-website-shared";

import {
  AdminRsvpReadUnavailableError,
  type AdminRsvpRepository
} from "./admin-rsvp-repository.js";

type DynamoDbKey = NonNullable<ScanCommandOutput["LastEvaluatedKey"]>;

export type AdminRsvpScanPage = {
  items: Record<string, unknown>[];
  lastEvaluatedKey?: DynamoDbKey;
};

export interface AdminRsvpDynamoDbClient {
  scan(input: ScanCommandInput): Promise<AdminRsvpScanPage>;
}

export class AwsAdminRsvpDynamoDbClient implements AdminRsvpDynamoDbClient {
  constructor(private readonly documentClient: DynamoDBDocumentClient) {}

  async scan(input: ScanCommandInput): Promise<AdminRsvpScanPage> {
    const output = await this.documentClient.send(new ScanCommand(input));

    return {
      items: (output.Items ?? []) as Record<string, unknown>[],
      ...(output.LastEvaluatedKey === undefined
        ? {}
        : { lastEvaluatedKey: output.LastEvaluatedKey })
    };
  }
}

export type DynamoDbAdminRsvpRepositoryOptions = {
  client: AdminRsvpDynamoDbClient;
  tableName: string;
};

export class DynamoDbAdminRsvpRepository implements AdminRsvpRepository {
  readonly #client: AdminRsvpDynamoDbClient;
  readonly #tableName: string;

  constructor(options: DynamoDbAdminRsvpRepositoryOptions) {
    this.#client = options.client;
    this.#tableName = options.tableName.trim();
  }

  async listSubmissions(): Promise<AdminRsvpSubmission[]> {
    if (!this.#tableName) {
      throw new AdminRsvpReadUnavailableError();
    }

    const submissions: AdminRsvpSubmission[] = [];
    let exclusiveStartKey: DynamoDbKey | undefined;

    try {
      do {
        const page = await this.#client.scan({
          TableName: this.#tableName,
          FilterExpression: "#itemType = :submissionType",
          ExpressionAttributeNames: { "#itemType": "itemType" },
          ExpressionAttributeValues: {
            ":submissionType": "RSVP_SUBMISSION"
          },
          ...(exclusiveStartKey === undefined
            ? {}
            : { ExclusiveStartKey: exclusiveStartKey })
        });

        for (const item of page.items) {
          if (item.itemType !== "RSVP_SUBMISSION") {
            continue;
          }

          const parsed = adminRsvpSubmissionSchema.safeParse(
            toPublicSubmission(item)
          );
          if (parsed.success) {
            submissions.push(parsed.data);
          }
        }

        exclusiveStartKey = page.lastEvaluatedKey;
      } while (exclusiveStartKey !== undefined);
    } catch {
      throw new AdminRsvpReadUnavailableError();
    }

    return submissions.sort((left, right) =>
      right.submittedAt.localeCompare(left.submittedAt)
    );
  }
}

function toPublicSubmission(
  item: Record<string, unknown>
): Record<string, unknown> {
  return {
    submissionId: item.submissionId,
    submittedAt: item.submittedAt,
    schemaVersion: item.schemaVersion,
    guestSide: item.guestSide,
    adults: item.adults,
    childrenAttending: item.childrenAttending,
    contact: item.contact,
    dietaryOrAllergyNotes: item.dietaryOrAllergyNotes,
    accessibilityNotes: item.accessibilityNotes,
    generalNote: item.generalNote
  };
}
