import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2
} from "aws-lambda";

import { createProductionAdminRsvpApiDependencies } from "./admin/production-dependencies.js";
import { createAdminRsvpAppRouter } from "./admin/router.js";
import { toApiRequest } from "./lambda.js";

const productionAdminRouter = createAdminRsvpAppRouter(
  createProductionAdminRsvpApiDependencies()
);

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> {
  return productionAdminRouter(toApiRequest(event));
}
