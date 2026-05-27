import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";

import {
  GITHUB_ACTIONS_OIDC_PROVIDER_ARN_EXPORT_NAME,
  GITHUB_ACTIONS_OIDC_PROVIDER_URL
} from "@repo/infra-patterns";

import { DomainFoundationStack } from "../lib/domain-foundation-stack.js";

describe("DomainFoundationStack", () => {
  it("creates a public hosted zone without blocking on certificate validation by default", () => {
    const app = new cdk.App();
    const stack = new DomainFoundationStack(app, "DomainFoundationStack", {
      domainName: "example.com",
      env: { account: "498283327683", region: "us-east-1" }
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::Route53::HostedZone", {
      Name: "example.com."
    });
    template.hasResourceProperties("Custom::AWSCDKOpenIdConnectProvider", {
      ClientIDList: ["sts.amazonaws.com"],
      Url: GITHUB_ACTIONS_OIDC_PROVIDER_URL
    });
    template.resourceCountIs("AWS::CertificateManager::Certificate", 0);
    template.hasOutput("HostedZoneId", {
      Export: { Name: "sandbox-domain-hosted-zone-id" },
      Value: Match.anyValue()
    });
    template.hasOutput("HostedZoneName", {
      Export: { Name: "sandbox-domain-hosted-zone-name" },
      Value: "example.com"
    });
    template.hasOutput("HostedZoneNameServers", { Value: Match.anyValue() });
    template.hasOutput("GitHubActionsOidcProviderArn", {
      Export: { Name: GITHUB_ACTIONS_OIDC_PROVIDER_ARN_EXPORT_NAME },
      Value: Match.anyValue()
    });
    expect(stack.certificate).toBeUndefined();
  });

  it("can issue the apex and wildcard certificate after nameserver delegation", () => {
    const app = new cdk.App();
    const stack = new DomainFoundationStack(app, "DomainFoundationStack", {
      domainName: "example.com",
      issueCertificate: true,
      env: { account: "498283327683", region: "us-east-1" }
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::CertificateManager::Certificate", {
      DomainName: "example.com",
      SubjectAlternativeNames: ["*.example.com", "www.example.com"],
      DomainValidationOptions: Match.arrayWith([
        Match.objectLike({ DomainName: "example.com" }),
        Match.objectLike({ DomainName: "www.example.com" })
      ])
    });
    template.hasOutput("CertificateArn", {
      Export: { Name: "sandbox-domain-certificate-arn" },
      Value: Match.anyValue()
    });
    expect(stack.certificate).toBeDefined();
  });

  it("can preserve Google Workspace mail and verification records", () => {
    const app = new cdk.App();
    const stack = new DomainFoundationStack(app, "DomainFoundationStack", {
      domainName: "bphillips.dev",
      preserveGoogleWorkspaceRecords: true,
      env: { account: "498283327683", region: "us-east-1" }
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::Route53::RecordSet", {
      Name: "bphillips.dev.",
      Type: "MX",
      ResourceRecords: Match.arrayWith([
        "1 aspmx.l.google.com",
        "5 alt1.aspmx.l.google.com",
        "5 alt2.aspmx.l.google.com",
        "10 alt3.aspmx.l.google.com",
        "10 alt4.aspmx.l.google.com"
      ]),
      TTL: "14400"
    });
    template.hasResourceProperties("AWS::Route53::RecordSet", {
      HostedZoneId: Match.anyValue(),
      Name: "bphillips.dev.",
      ResourceRecords: ['"v=spf1 include:_spf.google.com ~all"'],
      TTL: "14400",
      Type: "TXT"
    });
    template.hasResourceProperties("AWS::Route53::RecordSet", {
      HostedZoneId: Match.anyValue(),
      Name: "google._domainkey.bphillips.dev.",
      ResourceRecords: [
        Match.stringLikeRegexp('^"v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFA')
      ],
      TTL: "14400",
      Type: "TXT"
    });
    template.hasResourceProperties("AWS::Route53::RecordSet", {
      Name: "ps7zykca5yn7.bphillips.dev.",
      ResourceRecords: ["gv-oeaaomwz3imyse.dv.googlehosted.com"],
      TTL: "14400",
      Type: "CNAME"
    });
    template.hasResourceProperties("AWS::Route53::RecordSet", {
      Name: "hvrebfbe5mwa.bphillips.dev.",
      ResourceRecords: ["gv-p3vgf22k5uerzd.dv.googlehosted.com"],
      TTL: "14400",
      Type: "CNAME"
    });
  });
});
