import type {
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyEventV2
} from "aws-lambda";

import { handleRequest } from "./routes";

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> {
  const method = event.requestContext?.http?.method ?? "GET";
  const path = event.rawPath ?? "/";

  return handleRequest(method, path);
}
