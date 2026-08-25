#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";

import { WeddingWebsiteStack } from "../lib/wedding-website-stack";

const app = new cdk.App();
const WEDDING_WEBSITE_AWS_ACCOUNT = "498283327683";
const WEDDING_WEBSITE_AWS_REGION = "us-east-1";

new WeddingWebsiteStack(app, "WeddingWebsiteStack", {
  useSharedDomain: true,
  env: {
    account: WEDDING_WEBSITE_AWS_ACCOUNT,
    region: WEDDING_WEBSITE_AWS_REGION
  }
});
