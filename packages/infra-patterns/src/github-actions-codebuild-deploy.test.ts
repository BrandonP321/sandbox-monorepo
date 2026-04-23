import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, it } from "vitest";

import { GitHubActionsCodeBuildDeploy } from "./github-actions-codebuild-deploy.js";

describe("GitHubActionsCodeBuildDeploy", () => {
  it("creates the connection, deploy project, and starter role", () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");

    new GitHubActionsCodeBuildDeploy(stack, "Deploy", {
      buildSpecPath: "apps/portfolio/hello-world/hello-world-infra/buildspec.prod.yml",
      connectionName: "hello-world-prod-source",
      githubActionsBranch: "main",
      githubActionsRepo: "BrandonP321/sandbox-monorepo",
      githubBranch: "main",
      githubOwner: "BrandonP321",
      githubRepo: "sandbox-monorepo",
      projectName: "hello-world-prod-deploy",
      region: "us-east-1"
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::CodeConnections::Connection", {
      ConnectionName: "hello-world-prod-source",
      ProviderType: "GitHub"
    });

    template.hasResourceProperties("AWS::CodeBuild::Project", {
      Name: "hello-world-prod-deploy",
      Source: Match.objectLike({
        Auth: Match.objectLike({
          Type: "CODECONNECTIONS"
        }),
        BuildSpec:
          "apps/portfolio/hello-world/hello-world-infra/buildspec.prod.yml",
        Type: "GITHUB"
      })
    });

    template.hasResourceProperties("AWS::IAM::Role", {
      RoleName: "hello-world-prod-deploy-starter",
      AssumeRolePolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: "sts:AssumeRoleWithWebIdentity",
            Condition: Match.objectLike({
              StringEquals: Match.objectLike({
                "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
                "token.actions.githubusercontent.com:sub":
                  "repo:BrandonP321/sandbox-monorepo:ref:refs/heads/main"
              })
            })
          })
        ])
      })
    });

    template.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: Match.arrayWith([
              "codebuild:BatchGetBuilds",
              "codebuild:StartBuild"
            ])
          })
        ])
      })
    });
  });
});
