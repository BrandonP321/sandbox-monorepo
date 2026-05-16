import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { DashboardUiStorybookStack } from "../lib/dashboard-ui-storybook-stack.js";

describe("DashboardUiStorybookStack", () => {
  it("creates a static Storybook site and deploy pipeline", () => {
    const app = new cdk.App();
    const stack = new DashboardUiStorybookStack(
      app,
      "DashboardUiStorybookStack",
      {
        env: { account: "498283327683", region: "us-east-1" }
      }
    );

    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::CodeConnections::Connection", {
      ConnectionName: "dash-ui-storybook-prod-source",
      ProviderType: "GitHub"
    });

    template.hasResourceProperties("AWS::CodeBuild::Project", {
      Name: "dashboard-ui-storybook-prod-deploy",
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
            Value: "DashboardUiStorybookStack"
          })
        ])
      }),
      Source: Match.objectLike({
        BuildSpec:
          "apps/platform/dashboard-ui-storybook/dashboard-ui-storybook-infra/buildspec.prod.yml",
        Type: "CODEPIPELINE"
      })
    });

    template.hasResourceProperties("AWS::CodeBuild::Project", {
      Name: "dashboard-ui-storybook-prod-validate",
      Cache: { Type: "NO_CACHE" },
      Environment: Match.objectLike({
        ComputeType: "BUILD_LAMBDA_4GB",
        Image: "aws/codebuild/amazonlinux-x86_64-lambda-standard:nodejs24",
        ImagePullCredentialsType: "CODEBUILD",
        Type: "LINUX_LAMBDA_CONTAINER"
      }),
      Source: Match.objectLike({
        BuildSpec:
          "apps/platform/dashboard-ui-storybook/dashboard-ui-storybook-infra/buildspec.validate.yml",
        Type: "CODEPIPELINE"
      })
    });

    template.hasResourceProperties("AWS::CodePipeline::Pipeline", {
      Name: "dashboard-ui-storybook-prod",
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

  it("keeps deploy validation independent of native browser libraries", () => {
    const validateBuildSpec = readFileSync(
      join(process.cwd(), "buildspec.validate.yml"),
      "utf8"
    );

    expect(validateBuildSpec).toContain(
      "pnpm --filter @repo/dashboard-ui run test:unit"
    );
    expect(validateBuildSpec).toContain(
      "pnpm --filter @repo/dashboard-ui run build-storybook"
    );
    expect(validateBuildSpec).not.toContain("playwright install");
    expect(validateBuildSpec).not.toContain("@repo/dashboard-ui... run test");
  });
});
