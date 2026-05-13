import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";

import { PortfolioStack } from "../lib/portfolio-stack.js";

describe("PortfolioStack", () => {
  it("creates a static portfolio site and deploy pipeline", () => {
    const app = new cdk.App();
    const stack = new PortfolioStack(app, "PortfolioStack", {
      env: { account: "498283327683", region: "us-east-1" }
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::CodeBuild::Project", {
      Name: "portfolio-prod-deploy",
      Cache: { Type: "NO_CACHE" },
      Environment: Match.objectLike({
        ComputeType: "BUILD_LAMBDA_4GB",
        Image: "aws/codebuild/amazonlinux-x86_64-lambda-standard:nodejs24",
        ImagePullCredentialsType: "CODEBUILD",
        Type: "LINUX_LAMBDA_CONTAINER",
        EnvironmentVariables: Match.arrayWith([
          Match.objectLike({
            Name: "STACK_NAME",
            Type: "PLAINTEXT",
            Value: "PortfolioStack"
          })
        ])
      }),
      Source: Match.objectLike({
        BuildSpec:
          "apps/portfolio/portfolio/portfolio-infra/buildspec.prod.yml",
        Type: "CODEPIPELINE"
      })
    });

    template.hasResourceProperties("AWS::CodeBuild::Project", {
      Name: "portfolio-prod-validate",
      Cache: { Type: "NO_CACHE" },
      Environment: Match.objectLike({
        ComputeType: "BUILD_LAMBDA_4GB",
        Image: "aws/codebuild/amazonlinux-x86_64-lambda-standard:nodejs24",
        ImagePullCredentialsType: "CODEBUILD",
        Type: "LINUX_LAMBDA_CONTAINER"
      }),
      Source: Match.objectLike({
        BuildSpec:
          "apps/portfolio/portfolio/portfolio-infra/buildspec.validate.yml",
        Type: "CODEPIPELINE"
      })
    });

    template.hasResourceProperties("AWS::CodePipeline::Pipeline", {
      Name: "portfolio-prod",
      Stages: Match.arrayWith([
        Match.objectLike({ Name: "Source" }),
        Match.objectLike({
          Name: "Validate",
          Actions: Match.arrayWith([
            Match.objectLike({
              Name: "Validate",
              ActionTypeId: Match.objectLike({
                Category: "Build",
                Owner: "AWS",
                Provider: "CodeBuild"
              })
            })
          ])
        }),
        Match.objectLike({
          Name: "Prod",
          Actions: Match.arrayWith([
            Match.objectLike({
              Name: "Deploy",
              Namespace: "ProdUrls"
            })
          ])
        })
      ])
    });

    template.resourceCountIs("AWS::ApiGatewayV2::Api", 0);
    template.resourceCountIs("AWS::CloudFront::Distribution", 1);

    const outputs = Template.fromStack(stack).toJSON().Outputs ?? {};
    expect(outputs).not.toHaveProperty("ApiBaseUrl");
    expect(outputs).toHaveProperty("WebBucketName");
    expect(outputs).toHaveProperty("WebDistributionId");
  });
});
