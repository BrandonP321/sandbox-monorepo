import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { createAdminRsvpApiDependencies } from "../admin/dependencies.js";
import {
  AwsAdminRsvpDynamoDbClient,
  DynamoDbAdminRsvpRepository,
  type AdminRsvpDynamoDbClient
} from "../admin/dynamodb-admin-rsvp-repository.js";

export function createPreviewAdminDependencies(
  env: NodeJS.ProcessEnv,
  client?: AdminRsvpDynamoDbClient
) {
  if (!env.RSVP_TABLE_NAME)
    throw new Error("An explicit existing table is required");
  const tableName = env.RSVP_TABLE_NAME;
  const reader =
    client ??
    new AwsAdminRsvpDynamoDbClient(
      DynamoDBDocumentClient.from(new DynamoDBClient({ maxAttempts: 1 }))
    );
  return createAdminRsvpApiDependencies({
    accessKeySha256: env.ADMIN_ACCESS_KEY_SHA256 ?? "",
    repository: {
      async listSubmissions() {
        let pages = 0;
        return new DynamoDbAdminRsvpRepository({
          tableName,
          client: {
            async scan(input) {
              if (++pages > 10) throw new Error("Preview scan budget exceeded");
              return reader.scan({
                ...input,
                Limit: 200,
                ConsistentRead: false
              });
            }
          }
        }).listSubmissions();
      }
    }
  });
}
