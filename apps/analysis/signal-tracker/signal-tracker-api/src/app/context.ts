import type { APIGatewayProxyEventV2 } from "aws-lambda";

import type { ApiRequest } from "@repo/api-core";

export function toApiRequest(event: APIGatewayProxyEventV2): ApiRequest {
  return {
    method: event.requestContext?.http?.method ?? "GET",
    path: event.rawPath ?? "/",
    headers: event.headers,
    body: event.body,
    requestId: event.requestContext?.requestId
  };
}
