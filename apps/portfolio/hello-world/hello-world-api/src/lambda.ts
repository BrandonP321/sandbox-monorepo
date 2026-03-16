import type {
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyEventV2
} from "aws-lambda";

import { toApiRequest } from "./app/context";
import { appRouter } from "./app/router";

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> {
  return appRouter(toApiRequest(event));
}
