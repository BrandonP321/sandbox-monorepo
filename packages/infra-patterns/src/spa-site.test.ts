import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as route53 from "aws-cdk-lib/aws-route53";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";

import { SpaSite } from "./index.js";

describe("SpaSite", () => {
  it("provisions static hosting without runtime config deployments", () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");

    new SpaSite(stack, "Site");

    const template = Template.fromStack(stack);

    template.resourceCountIs("Custom::CDKBucketDeployment", 0);
    template.resourceCountIs("AWS::S3::Bucket", 1);
    template.resourceCountIs("AWS::CloudFront::Distribution", 1);
    template.hasResourceProperties("AWS::CloudFront::Distribution", {
      DistributionConfig: Match.objectLike({
        DefaultCacheBehavior: Match.objectLike({
          FunctionAssociations: Match.absent(),
          ViewerProtocolPolicy: "allow-all"
        })
      })
    });
  });

  it("can protect the default behavior with a CloudFront function", () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");
    const viewerRequestFunction = new cloudfront.Function(
      stack,
      "ViewerRequestFunction",
      {
        code: cloudfront.FunctionCode.fromInline(
          "function handler(event) { return event.request; }"
        ),
        runtime: cloudfront.FunctionRuntime.JS_2_0
      }
    );

    new SpaSite(stack, "Site", {
      defaultBehavior: {
        functionAssociations: [
          {
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
            function: viewerRequestFunction
          }
        ],
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      }
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::CloudFront::Distribution", {
      DistributionConfig: Match.objectLike({
        DefaultCacheBehavior: Match.objectLike({
          FunctionAssociations: [
            Match.objectLike({ EventType: "viewer-request" })
          ],
          ViewerProtocolPolicy: "redirect-to-https"
        })
      })
    });
  });

  it("can attach custom domains and create Route 53 aliases", () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");
    const hostedZone = new route53.PublicHostedZone(stack, "HostedZone", {
      zoneName: "example.com"
    });
    const certificate = acm.Certificate.fromCertificateArn(
      stack,
      "Certificate",
      "arn:aws:acm:us-east-1:123456789012:certificate/example"
    );

    new SpaSite(stack, "Site", {
      customDomain: {
        certificate,
        dns: { hostedZone },
        domainNames: ["example.com", "www.example.com"]
      }
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::CloudFront::Distribution", {
      DistributionConfig: Match.objectLike({
        Aliases: ["example.com", "www.example.com"],
        ViewerCertificate: Match.objectLike({
          AcmCertificateArn:
            "arn:aws:acm:us-east-1:123456789012:certificate/example",
          SslSupportMethod: "sni-only"
        })
      })
    });
    template.resourcePropertiesCountIs(
      "AWS::Route53::RecordSet",
      { Type: "A" },
      2
    );
    template.resourcePropertiesCountIs(
      "AWS::Route53::RecordSet",
      { Type: "AAAA" },
      2
    );
    template.hasResourceProperties("AWS::Route53::RecordSet", {
      Name: "example.com.",
      Type: "A"
    });
    template.hasResourceProperties("AWS::Route53::RecordSet", {
      Name: "www.example.com.",
      Type: "A"
    });
  });

  it("can create aliases for one distribution across hosted zones", () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");
    const legacyHostedZone = route53.HostedZone.fromHostedZoneAttributes(
      stack,
      "LegacyHostedZone",
      {
        hostedZoneId: "ZLEGACYEXAMPLE",
        zoneName: "example.com"
      }
    );
    const canonicalHostedZone = route53.HostedZone.fromHostedZoneAttributes(
      stack,
      "CanonicalHostedZone",
      {
        hostedZoneId: "ZCANONICALEXAMPLE",
        zoneName: "new-example.com"
      }
    );
    const certificate = acm.Certificate.fromCertificateArn(
      stack,
      "Certificate",
      "arn:aws:acm:us-east-1:123456789012:certificate/example"
    );

    new SpaSite(stack, "Site", {
      customDomain: {
        certificate,
        dnsAliases: [
          {
            domainName: "new-example.com",
            hostedZone: canonicalHostedZone
          },
          {
            domainName: "www.new-example.com",
            hostedZone: canonicalHostedZone
          },
          {
            domainName: "legacy.example.com",
            hostedZone: legacyHostedZone
          }
        ],
        domainNames: [
          "new-example.com",
          "www.new-example.com",
          "legacy.example.com"
        ]
      }
    });

    const template = Template.fromStack(stack);

    template.resourceCountIs("AWS::CloudFront::Distribution", 1);
    template.hasResourceProperties("AWS::CloudFront::Distribution", {
      DistributionConfig: Match.objectLike({
        Aliases: [
          "new-example.com",
          "www.new-example.com",
          "legacy.example.com"
        ]
      })
    });
    template.resourcePropertiesCountIs(
      "AWS::Route53::RecordSet",
      { HostedZoneId: "ZCANONICALEXAMPLE", Type: "A" },
      2
    );
    template.resourcePropertiesCountIs(
      "AWS::Route53::RecordSet",
      { HostedZoneId: "ZCANONICALEXAMPLE", Type: "AAAA" },
      2
    );
    template.resourcePropertiesCountIs(
      "AWS::Route53::RecordSet",
      { HostedZoneId: "ZLEGACYEXAMPLE", Type: "A" },
      1
    );
    template.resourcePropertiesCountIs(
      "AWS::Route53::RecordSet",
      { HostedZoneId: "ZLEGACYEXAMPLE", Type: "AAAA" },
      1
    );
  });

  it("rejects DNS aliases that do not belong to the distribution", () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      stack,
      "HostedZone",
      {
        hostedZoneId: "ZEXAMPLE",
        zoneName: "example.com"
      }
    );
    const certificate = acm.Certificate.fromCertificateArn(
      stack,
      "Certificate",
      "arn:aws:acm:us-east-1:123456789012:certificate/example"
    );

    expect(
      () =>
        new SpaSite(stack, "Site", {
          customDomain: {
            certificate,
            dnsAliases: [{ domainName: "other.example.com", hostedZone }],
            domainNames: ["example.com"]
          }
        })
    ).toThrow(
      "SpaSite DNS alias other.example.com is not a configured custom domain."
    );
  });
});
