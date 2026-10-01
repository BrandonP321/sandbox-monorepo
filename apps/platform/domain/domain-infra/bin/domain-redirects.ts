#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { DomainRedirectsStack } from "../lib/domain-redirects-stack.js";
const app = new cdk.App();
new DomainRedirectsStack(app, "DomainRedirectsStack", {
  synthesizer: new cdk.BootstraplessSynthesizer(),
  env: { account: "498283327683", region: "us-east-1" }
});
