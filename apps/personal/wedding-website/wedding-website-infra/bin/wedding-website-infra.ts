#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";

import { WeddingWebsiteStack } from "../lib/wedding-website-stack";

const app = new cdk.App();
const WEDDING_WEBSITE_AWS_ACCOUNT = "498283327683";
const WEDDING_WEBSITE_AWS_REGION = "us-east-1";

new WeddingWebsiteStack(app, "WeddingWebsiteStack", {
  disableExecuteApiEndpoint: resolveDisableExecuteApiEndpoint(app),
  useSharedDomain: true,
  env: {
    account: WEDDING_WEBSITE_AWS_ACCOUNT,
    region: WEDDING_WEBSITE_AWS_REGION
  }
});

function resolveDisableExecuteApiEndpoint(app: cdk.App): boolean | undefined {
  const value = app.node.tryGetContext("disableExecuteApiEndpoint") as unknown;

  if (value === undefined) {
    return undefined;
  }
  if (value === true || value === "true") {
    return true;
  }
  if (value === false || value === "false") {
    return false;
  }

  throw new Error(
    "CDK context disableExecuteApiEndpoint must be true or false."
  );
}
