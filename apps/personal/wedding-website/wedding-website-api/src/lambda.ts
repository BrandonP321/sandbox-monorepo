import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2
} from "aws-lambda";

import type { ApiRequest } from "@repo/api-core";

import { createProductionWeddingWebsiteApiDependencies } from "./app/production-dependencies.js";
import { createWeddingWebsiteAppRouter } from "./app/router.js";

const productionAppRouter = createWeddingWebsiteAppRouter(
  createProductionWeddingWebsiteApiDependencies()
);

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> {
  return productionAppRouter(toApiRequest(event));
}

export function toApiRequest(event: APIGatewayProxyEventV2): ApiRequest {
  return {
    method: event.requestContext?.http?.method ?? "GET",
    path: event.rawPath ?? "/",
    headers: event.headers,
    body:
      event.isBase64Encoded && event.body
        ? Buffer.from(event.body, "base64").toString("utf8")
        : event.body,
    requestId: event.requestContext?.requestId
  };
}
