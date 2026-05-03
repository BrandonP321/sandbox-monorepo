import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";

import { GitHubActionsCodePipelineDeploy } from "./github-actions-codepipeline-deploy.js";

describe("GitHubActionsCodePipelineDeploy", () => {
  it("creates the connection, pipeline, deploy project, and starter role", () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");

    new GitHubActionsCodePipelineDeploy(stack, "Deploy", {
      buildSpecPath:
        "apps/portfolio/hello-world/hello-world-infra/buildspec.prod.yml",
      connectionName: "hello-world-prod-source",
      deployStackName: "HelloWorldStack",
      githubActionsBranch: "main",
      githubActionsRepo: "BrandonP321/sandbox-monorepo",
      githubBranch: "main",
      githubOwner: "BrandonP321",
      githubRepo: "sandbox-monorepo",
      pipelineName: "hello-world-prod",
      projectName: "hello-world-prod-deploy",
      region: "us-east-1",
      sourceActionName: "Source",
      validationBuildSpecPath:
        "apps/portfolio/hello-world/hello-world-infra/buildspec.validate.yml"
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::CodeConnections::Connection", {
      ConnectionName: "hello-world-prod-source",
      ProviderType: "GitHub"
    });

    template.hasResourceProperties("AWS::CodeBuild::Project", {
      Name: "hello-world-prod-deploy",
      Cache: Match.objectLike({
        Modes: ["LOCAL_CUSTOM_CACHE"],
        Type: "LOCAL"
      }),
      Environment: Match.objectLike({
        ComputeType: "BUILD_GENERAL1_SMALL",
        Image: "aws/codebuild/standard:7.0",
        Type: "LINUX_CONTAINER",
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
      Cache: Match.objectLike({
        Modes: ["LOCAL_CUSTOM_CACHE"],
        Type: "LOCAL"
      }),
      Environment: Match.objectLike({
        ComputeType: "BUILD_GENERAL1_SMALL",
        Image: "aws/codebuild/standard:7.0",
        Type: "LINUX_CONTAINER"
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
              ActionTypeId: Match.objectLike({
                Category: "Build",
                Owner: "AWS",
                Provider: "CodeBuild"
              }),
              Namespace: "ProdUrls"
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
            Action: "codepipeline:StartPipelineExecution"
          })
        ])
      })
    });
  });

  it("can reuse an existing GitHub OIDC provider", () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack", {
      env: { account: "123456789012", region: "us-east-1" }
    });

    new GitHubActionsCodePipelineDeploy(stack, "Deploy", {
      buildSpecPath:
        "apps/analysis/signal-tracker/signal-tracker-infra/buildspec.prod.yml",
      connectionName: "signal-tracker-prod-source",
      deployStackName: "SignalTrackerStack",
      githubActionsBranch: "main",
      githubActionsRepo: "BrandonP321/sandbox-monorepo",
      githubOidcProviderArn:
        "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com",
      githubBranch: "main",
      githubOwner: "BrandonP321",
      githubRepo: "sandbox-monorepo",
      pipelineName: "signal-tracker-prod",
      projectName: "signal-tracker-prod-deploy",
      region: "us-east-1",
      sourceActionName: "Source",
      validationBuildSpecPath:
        "apps/analysis/signal-tracker/signal-tracker-infra/buildspec.validate.yml"
    });

    const template = Template.fromStack(stack);

    template.resourceCountIs("AWS::IAM::OIDCProvider", 0);
    template.hasResourceProperties("AWS::IAM::Role", {
      RoleName: "signal-tracker-prod-starter",
      AssumeRolePolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Principal: Match.objectLike({
              Federated:
                "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"
            })
          })
        ])
      })
    });
  });

  it("can preserve a legacy validation project construct id", () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");

    new GitHubActionsCodePipelineDeploy(stack, "Deploy", {
      buildSpecPath:
        "apps/portfolio/hello-world/hello-world-infra/buildspec.prod.yml",
      connectionName: "hello-world-prod-source",
      deployStackName: "HelloWorldStack",
      githubActionsBranch: "main",
      githubActionsRepo: "BrandonP321/sandbox-monorepo",
      githubBranch: "main",
      githubOwner: "BrandonP321",
      githubRepo: "sandbox-monorepo",
      pipelineName: "hello-world-prod",
      projectName: "hello-world-prod-deploy",
      region: "us-east-1",
      sourceActionName: "Source",
      validationBuildSpecPath:
        "apps/portfolio/hello-world/hello-world-infra/buildspec.validate.yml",
      validationProjectConstructId: "ValidationProject"
    });

    const template = Template.fromStack(stack);
    const validationProjectLogicalIds = Object.keys(
      template.findResources("AWS::CodeBuild::Project", {
        Properties: { Name: "hello-world-prod-validate" }
      })
    );

    expect(validationProjectLogicalIds).toHaveLength(1);
    expect(validationProjectLogicalIds[0]).toContain("ValidationProject");
    expect(validationProjectLogicalIds[0]).not.toContain("ValidateProject");
  });

  it("can use Lambda compute for the deploy project", () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");

    new GitHubActionsCodePipelineDeploy(stack, "Deploy", {
      buildSpecPath:
        "apps/analysis/signal-tracker/signal-tracker-infra/buildspec.prod.yml",
      connectionName: "signal-tracker-prod-source",
      deployBuildEnvironment: { computeMode: "lambda" },
      deployStackName: "SignalTrackerStack",
      githubActionsBranch: "main",
      githubActionsRepo: "BrandonP321/sandbox-monorepo",
      githubBranch: "main",
      githubOwner: "BrandonP321",
      githubRepo: "sandbox-monorepo",
      pipelineName: "signal-tracker-prod",
      projectName: "signal-tracker-prod-deploy",
      region: "us-east-1",
      sourceActionName: "Source",
      validationBuildSpecPath:
        "apps/analysis/signal-tracker/signal-tracker-infra/buildspec.validate.yml"
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::CodeBuild::Project", {
      Name: "signal-tracker-prod-deploy",
      Environment: Match.objectLike({
        ComputeType: "BUILD_LAMBDA_4GB",
        Image: "aws/codebuild/amazonlinux-x86_64-lambda-standard:nodejs24",
        ImagePullCredentialsType: "CODEBUILD",
        Type: "LINUX_LAMBDA_CONTAINER"
      })
    });
    template.hasResourceProperties("AWS::CodeBuild::Project", {
      Cache: { Type: "NO_CACHE" }
    });
    template.hasResourceProperties("AWS::CodeBuild::Project", {
      Name: "signal-tracker-prod-validate",
      Cache: { Type: "NO_CACHE" },
      Environment: Match.objectLike({
        ComputeType: "BUILD_LAMBDA_4GB",
        Image: "aws/codebuild/amazonlinux-x86_64-lambda-standard:nodejs24",
        ImagePullCredentialsType: "CODEBUILD",
        Type: "LINUX_LAMBDA_CONTAINER"
      }),
      Source: Match.objectLike({
        BuildSpec:
          "apps/analysis/signal-tracker/signal-tracker-infra/buildspec.validate.yml",
        Type: "CODEPIPELINE"
      })
    });
  });

  it("can create parallel validation actions", () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");

    new GitHubActionsCodePipelineDeploy(stack, "Deploy", {
      buildSpecPath:
        "apps/analysis/signal-tracker/signal-tracker-infra/buildspec.prod.yml",
      connectionName: "signal-tracker-prod-source",
      deployBuildEnvironment: { computeMode: "lambda" },
      deployStackName: "SignalTrackerStack",
      githubActionsBranch: "main",
      githubActionsRepo: "BrandonP321/sandbox-monorepo",
      githubBranch: "main",
      githubOwner: "BrandonP321",
      githubRepo: "sandbox-monorepo",
      pipelineName: "signal-tracker-prod",
      projectName: "signal-tracker-prod-deploy",
      region: "us-east-1",
      sourceActionName: "Source",
      validationActions: [
        {
          actionName: "Lint",
          buildSpecPath:
            "apps/analysis/signal-tracker/signal-tracker-infra/buildspec.validate.lint.yml"
        },
        {
          actionName: "Typecheck",
          buildSpecPath:
            "apps/analysis/signal-tracker/signal-tracker-infra/buildspec.validate.typecheck.yml"
        }
      ]
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::CodeBuild::Project", {
      Name: "signal-tracker-prod-validate-lint",
      Source: Match.objectLike({
        BuildSpec:
          "apps/analysis/signal-tracker/signal-tracker-infra/buildspec.validate.lint.yml"
      })
    });
    template.hasResourceProperties("AWS::CodeBuild::Project", {
      Name: "signal-tracker-prod-validate-typecheck",
      Source: Match.objectLike({
        BuildSpec:
          "apps/analysis/signal-tracker/signal-tracker-infra/buildspec.validate.typecheck.yml"
      })
    });
    template.hasResourceProperties("AWS::CodePipeline::Pipeline", {
      Stages: Match.arrayWith([
        Match.objectLike({
          Name: "Validate",
          Actions: Match.arrayWith([
            Match.objectLike({
              Name: "Lint",
              RunOrder: 1
            }),
            Match.objectLike({
              Name: "Typecheck",
              RunOrder: 1
            })
          ])
        })
      ])
    });
  });
});
