import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import { createLogger, type Logger } from "@repo/api-core";

import {
  AwsAdminRsvpDynamoDbClient,
  DynamoDbAdminRsvpRepository,
  type AdminRsvpDynamoDbClient
} from "./dynamodb-admin-rsvp-repository.js";
import {
  createAdminRsvpApiDependencies,
  type AdminRsvpApiDependencies
} from "./dependencies.js";

export type ProductionAdminRsvpDependencyOptions = {
  client?: AdminRsvpDynamoDbClient;
  env?: NodeJS.ProcessEnv;
  logger?: Logger;
};

export function createProductionAdminRsvpApiDependencies(
  options: ProductionAdminRsvpDependencyOptions = {}
): AdminRsvpApiDependencies {
  const env = options.env ?? process.env;
  const logger = options.logger ?? createLogger();
  const client = options.client ?? createAdminRsvpDynamoDbClient();

  return createAdminRsvpApiDependencies({
    accessKeySha256: env.ADMIN_ACCESS_KEY_SHA256 ?? "",
    logger,
    repository: new DynamoDbAdminRsvpRepository({
      client,
      tableName: env.RSVP_TABLE_NAME ?? ""
    })
  });
}

function createAdminRsvpDynamoDbClient(): AdminRsvpDynamoDbClient {
  const lowLevelClient = new DynamoDBClient({ maxAttempts: 3 });
  const documentClient = DynamoDBDocumentClient.from(lowLevelClient, {
    marshallOptions: { removeUndefinedValues: true }
  });

  return new AwsAdminRsvpDynamoDbClient(documentClient);
}
