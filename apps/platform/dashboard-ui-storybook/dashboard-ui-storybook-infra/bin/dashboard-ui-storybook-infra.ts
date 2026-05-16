#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";

import { DashboardUiStorybookStack } from "../lib/dashboard-ui-storybook-stack.js";

const app = new cdk.App();
const DASHBOARD_UI_STORYBOOK_AWS_ACCOUNT = "498283327683";
const DASHBOARD_UI_STORYBOOK_AWS_REGION = "us-east-1";

new DashboardUiStorybookStack(app, "DashboardUiStorybookStack", {
  env: {
    account: DASHBOARD_UI_STORYBOOK_AWS_ACCOUNT,
    region: DASHBOARD_UI_STORYBOOK_AWS_REGION
  }
});
