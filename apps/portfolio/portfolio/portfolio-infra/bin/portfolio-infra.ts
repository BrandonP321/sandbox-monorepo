#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";

import { PortfolioStack } from "../lib/portfolio-stack";

const app = new cdk.App();
const PORTFOLIO_AWS_ACCOUNT = "498283327683";
const PORTFOLIO_AWS_REGION = "us-east-1";

new PortfolioStack(app, "PortfolioStack", {
  env: {
    account: PORTFOLIO_AWS_ACCOUNT,
    region: PORTFOLIO_AWS_REGION
  }
});
