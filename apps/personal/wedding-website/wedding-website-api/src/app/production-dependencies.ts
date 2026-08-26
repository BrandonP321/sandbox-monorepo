import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import { createLogger, type Logger } from "@repo/api-core";

import {
  AwsRsvpDynamoDbClient,
  DynamoDbRsvpSubmissionRepository,
  type RsvpDynamoDbClient
} from "../rsvp/dynamodb-rsvp-repository.js";
import {
  createWeddingWebsiteApiDependencies,
  type WeddingWebsiteApiDependencies
} from "./dependencies.js";

export type ProductionWeddingWebsiteApiDependencyOptions = {
  client?: RsvpDynamoDbClient;
  env?: NodeJS.ProcessEnv;
  logger?: Logger;
};

export function createProductionWeddingWebsiteApiDependencies(
  options: ProductionWeddingWebsiteApiDependencyOptions = {}
): WeddingWebsiteApiDependencies {
  const env = options.env ?? process.env;
  const client = options.client ?? createRsvpDynamoDbClient();
  const logger = options.logger ?? createLogger();

  return createWeddingWebsiteApiDependencies({
    repository: new DynamoDbRsvpSubmissionRepository({
      client,
      logger,
      tableName: env.RSVP_TABLE_NAME ?? ""
    }),
    logger
  });
}

function createRsvpDynamoDbClient(): RsvpDynamoDbClient {
  const lowLevelClient = new DynamoDBClient({ maxAttempts: 3 });
  const documentClient = DynamoDBDocumentClient.from(lowLevelClient, {
    marshallOptions: { removeUndefinedValues: true }
  });

  return new AwsRsvpDynamoDbClient(documentClient);
}
