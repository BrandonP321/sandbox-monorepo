import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as route53 from "aws-cdk-lib/aws-route53";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, it } from "vitest";

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
});
