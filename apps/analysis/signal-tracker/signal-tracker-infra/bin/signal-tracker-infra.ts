#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";

import { SignalTrackerStack } from "../lib/signal-tracker-stack";

const app = new cdk.App();

new SignalTrackerStack(app, "SignalTrackerStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});
