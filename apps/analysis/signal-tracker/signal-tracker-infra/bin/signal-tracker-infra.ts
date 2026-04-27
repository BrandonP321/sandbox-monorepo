#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";

import { resolveSignalTrackerDatabaseCapacityMode } from "../lib/signal-tracker-database";
import { SignalTrackerStack } from "../lib/signal-tracker-stack";

const app = new cdk.App();

new SignalTrackerStack(app, "SignalTrackerStack", {
  databaseCapacityMode: resolveSignalTrackerDatabaseCapacityMode(app),
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});
