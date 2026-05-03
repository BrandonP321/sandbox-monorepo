import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";

import { HelloWorldStack } from "../lib/hello-world-stack.js";

describe("HelloWorldStack", () => {
  it("creates a Lambda-backed deploy pipeline with the legacy validation project id", () => {
    const app = new cdk.App();
    const stack = new HelloWorldStack(app, "HelloWorldStack", {
      env: { account: "498283327683", region: "us-east-1" }
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::CodeBuild::Project", {
      Name: "hello-world-prod-deploy",
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
            Value: "HelloWorldStack"
          })
        ])
      }),
      Source: Match.objectLike({
        BuildSpec:
          "apps/portfolio/hello-world/hello-world-infra/buildspec.prod.yml",
        Type: "CODEPIPELINE"
      })
    });

    template.hasResourceProperties("AWS::CodeBuild::Project", {
      Name: "hello-world-prod-validate",
      Cache: { Type: "NO_CACHE" },
      Environment: Match.objectLike({
        ComputeType: "BUILD_LAMBDA_4GB",
        Image: "aws/codebuild/amazonlinux-x86_64-lambda-standard:nodejs24",
        ImagePullCredentialsType: "CODEBUILD",
        Type: "LINUX_LAMBDA_CONTAINER"
      }),
      Source: Match.objectLike({
        BuildSpec:
          "apps/portfolio/hello-world/hello-world-infra/buildspec.validate.yml",
        Type: "CODEPIPELINE"
      })
    });

    template.hasResourceProperties("AWS::CodePipeline::Pipeline", {
      Name: "hello-world-prod",
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

    const validationProjectLogicalIds = Object.keys(
      template.findResources("AWS::CodeBuild::Project", {
        Properties: { Name: "hello-world-prod-validate" }
      })
    );

    expect(validationProjectLogicalIds).toHaveLength(1);
    expect(validationProjectLogicalIds[0]).toContain("ValidationProject");
    expect(validationProjectLogicalIds[0]).not.toContain("ValidateProject");

    template.hasOutput("WebBucketName", {
      Value: Match.anyValue()
    });
    template.hasOutput("WebDistributionId", {
      Value: Match.anyValue()
    });
  });
});
