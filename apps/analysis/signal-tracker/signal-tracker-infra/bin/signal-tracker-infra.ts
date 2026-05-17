#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";

import { resolveSignalTrackerDatabaseCapacityMode } from "../lib/signal-tracker-database";
import { SignalTrackerStack } from "../lib/signal-tracker-stack";

const app = new cdk.App();
const SIGNAL_TRACKER_AWS_ACCOUNT = "498283327683";
const SIGNAL_TRACKER_AWS_REGION = "us-east-1";

new SignalTrackerStack(app, "SignalTrackerStack", {
  databaseCapacityMode: resolveSignalTrackerDatabaseCapacityMode(app),
  useSharedDomain: true,
  env: {
    account: SIGNAL_TRACKER_AWS_ACCOUNT,
    region: SIGNAL_TRACKER_AWS_REGION
  }
});
