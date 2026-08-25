import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";

import { WeddingWebsiteStack } from "../lib/wedding-website-stack.js";

interface SynthesizedPipeline {
  readonly Properties: {
    readonly Stages: readonly {
      readonly Actions: readonly {
        readonly Configuration?: Record<string, unknown>;
        readonly Name: string;
      }[];
      readonly Name: string;
    }[];
  };
}

describe("WeddingWebsiteStack", () => {
  it("creates protected static hosting and one production pipeline", () => {
    const app = new cdk.App();
    const stack = new WeddingWebsiteStack(app, "WeddingWebsiteStack", {
      env: { account: "498283327683", region: "us-east-1" },
      useSharedDomain: true
    });
    const template = Template.fromStack(stack);

    template.hasParameter("PreviewPassword", {
      AllowedPattern: "^[A-Za-z0-9]{32,128}$",
      NoEcho: true,
      Type: "String"
    });
    template.hasResourceProperties("AWS::S3::Bucket", {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true
      }
    });
    template.resourceCountIs("AWS::CloudFront::Distribution", 1);
    template.hasResourceProperties("AWS::CloudFront::Distribution", {
      DistributionConfig: Match.objectLike({
        Aliases: ["wedding.bphillips.dev"],
        DefaultCacheBehavior: Match.objectLike({
          FunctionAssociations: [
            Match.objectLike({ EventType: "viewer-request" })
          ],
          ViewerProtocolPolicy: "redirect-to-https"
        }),
        ViewerCertificate: Match.objectLike({
          AcmCertificateArn: {
            "Fn::ImportValue": "sandbox-domain-certificate-arn"
          }
        })
      })
    });
    template.hasResourceProperties("AWS::CloudFront::Function", {
      FunctionConfig: Match.objectLike({ Runtime: "cloudfront-js-2.0" })
    });
    template.resourcePropertiesCountIs(
      "AWS::Route53::RecordSet",
      { Name: "wedding.bphillips.dev.", Type: "A" },
      1
    );
    template.resourcePropertiesCountIs(
      "AWS::Route53::RecordSet",
      { Name: "wedding.bphillips.dev.", Type: "AAAA" },
      1
    );
    template.hasResourceProperties("AWS::Route53::RecordSet", {
      HostedZoneId: {
        "Fn::ImportValue": "sandbox-domain-hosted-zone-id"
      }
    });

    template.hasResourceProperties("AWS::CodeBuild::Project", {
      Name: "wedding-website-prod-deploy",
      Cache: { Type: "NO_CACHE" },
      Environment: Match.objectLike({
        ComputeType: "BUILD_LAMBDA_4GB",
        Image: "aws/codebuild/amazonlinux-x86_64-lambda-standard:nodejs24",
        Type: "LINUX_LAMBDA_CONTAINER"
      }),
      Source: Match.objectLike({
        BuildSpec:
          "apps/personal/wedding-website/wedding-website-infra/buildspec.prod.yml",
        Type: "CODEPIPELINE"
      })
    });
    template.hasResourceProperties("AWS::CodeBuild::Project", {
      Name: "wedding-website-prod-validate",
      Source: Match.objectLike({
        BuildSpec:
          "apps/personal/wedding-website/wedding-website-infra/buildspec.validate.yml",
        Type: "CODEPIPELINE"
      })
    });

    const pipelineResources = Object.values(
      template.findResources("AWS::CodePipeline::Pipeline")
    ) as SynthesizedPipeline[];
    expect(pipelineResources).toHaveLength(1);
    expect(
      pipelineResources[0]?.Properties.Stages.map((stage) => stage.Name)
    ).toEqual(["Source", "Validate", "Prod"]);
    expect(
      pipelineResources[0]?.Properties.Stages[0]?.Actions[0]
    ).toMatchObject({
      Name: "Source",
      Configuration: {
        BranchName: "main",
        DetectChanges: false,
        FullRepositoryId: "BrandonP321/sandbox-monorepo"
      }
    });

    template.hasResourceProperties("AWS::IAM::Role", {
      RoleName: "wedding-website-prod-starter",
      AssumeRolePolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Principal: Match.objectLike({
              Federated: {
                "Fn::ImportValue": "sandbox-github-actions-oidc-provider-arn"
              }
            })
          })
        ])
      })
    });

    template.resourceCountIs("AWS::ApiGatewayV2::Api", 0);
    template.resourceCountIs("AWS::IAM::OIDCProvider", 0);

    const synthesizedTemplate = JSON.stringify(template.toJSON());
    expect(synthesizedTemplate).toContain("statusCode: 401");
    expect(synthesizedTemplate).toContain("www-authenticate");
    expect(synthesizedTemplate).not.toContain("niamhandbrandon.com");

    const outputs = template.toJSON().Outputs ?? {};
    expect(outputs).toHaveProperty("WebUrl");
    expect(outputs).toHaveProperty("WebBucketName");
    expect(outputs).toHaveProperty("WebDistributionId");
  });

  it("loads the preview password from Secrets Manager without echoing it", () => {
    const prodBuildspec = readFileSync(resolve("buildspec.prod.yml"), "utf8");

    expect(prodBuildspec).toContain(
      "WEDDING_PREVIEW_PASSWORD: wedding-website/prod/preview-password"
    );
    expect(prodBuildspec).toContain("deploy:ci:no-build");
    expect(prodBuildspec).not.toMatch(/echo.*WEDDING_PREVIEW_PASSWORD/);
  });
});
