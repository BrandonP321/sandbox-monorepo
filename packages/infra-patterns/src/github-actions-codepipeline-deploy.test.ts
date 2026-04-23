import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, it } from "vitest";

import { GitHubActionsCodePipelineDeploy } from "./github-actions-codepipeline-deploy.js";

describe("GitHubActionsCodePipelineDeploy", () => {
  it("creates the connection, pipeline, deploy project, and starter role", () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");

    new GitHubActionsCodePipelineDeploy(stack, "Deploy", {
      buildSpecPath:
        "apps/portfolio/hello-world/hello-world-infra/buildspec.prod.yml",
      connectionName: "hello-world-prod-source",
      githubActionsBranch: "main",
      githubActionsRepo: "BrandonP321/sandbox-monorepo",
      githubBranch: "main",
      githubOwner: "BrandonP321",
      githubRepo: "sandbox-monorepo",
      pipelineName: "hello-world-prod",
      projectName: "hello-world-prod-deploy",
      region: "us-east-1",
      sourceActionName: "Source"
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::CodeConnections::Connection", {
      ConnectionName: "hello-world-prod-source",
      ProviderType: "GitHub"
    });

    template.hasResourceProperties("AWS::CodeBuild::Project", {
      Name: "hello-world-prod-deploy",
      Source: Match.objectLike({
        BuildSpec:
          "apps/portfolio/hello-world/hello-world-infra/buildspec.prod.yml",
        Type: "CODEPIPELINE"
      })
    });

    template.hasResourceProperties("AWS::CodePipeline::Pipeline", {
      Name: "hello-world-prod",
      Stages: Match.arrayWith([
        Match.objectLike({
          Name: "Source",
          Actions: Match.arrayWith([
            Match.objectLike({
              Name: "Source",
              ActionTypeId: Match.objectLike({
                Category: "Source",
                Owner: "AWS",
                Provider: "CodeStarSourceConnection"
              }),
              Configuration: Match.objectLike({
                BranchName: "main",
                DetectChanges: false,
                FullRepositoryId: "BrandonP321/sandbox-monorepo"
              })
            })
          ])
        }),
        Match.objectLike({
          Name: "Prod",
          Actions: Match.arrayWith([
            Match.objectLike({
              Name: "Deploy",
              ActionTypeId: Match.objectLike({
                Category: "Build",
                Owner: "AWS",
                Provider: "CodeBuild"
              })
            })
          ])
        })
      ])
    });

    template.hasResourceProperties("AWS::IAM::Role", {
      RoleName: "hello-world-prod-starter",
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
              "codepipeline:GetPipelineExecution",
              "codepipeline:ListActionExecutions",
              "codepipeline:StartPipelineExecution"
            ])
          })
        ])
      })
    });
  });
});
