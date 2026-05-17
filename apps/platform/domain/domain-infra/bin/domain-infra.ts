#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";

import { DomainFoundationStack } from "../lib/domain-foundation-stack";

const app = new cdk.App();
const DOMAIN_AWS_ACCOUNT = "498283327683";
const DOMAIN_AWS_REGION = "us-east-1";

const domainName = app.node.tryGetContext("domainName");
const issueCertificate =
  String(app.node.tryGetContext("issueCertificate") ?? "false") === "true";
const preserveGoogleWorkspaceRecords =
  String(
    app.node.tryGetContext("preserveGoogleWorkspaceRecords") ?? "false"
  ) === "true";

if (typeof domainName !== "string" || !domainName.trim()) {
  throw new Error(
    "Pass the root domain with `-c domainName=example.com`. Use `-c issueCertificate=true` only after Route 53 nameserver delegation is live."
  );
}

new DomainFoundationStack(app, "DomainFoundationStack", {
  domainName,
  issueCertificate,
  preserveGoogleWorkspaceRecords,
  env: {
    account: DOMAIN_AWS_ACCOUNT,
    region: DOMAIN_AWS_REGION
  }
});
