import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, it } from "vitest";

import { SignalTrackerStack } from "../lib/signal-tracker-stack.js";

describe("SignalTrackerStack", () => {
  it("creates the Signal Tracker deploy pipeline", () => {
    const app = new cdk.App();
    const stack = new SignalTrackerStack(app, "SignalTrackerStack", {
      env: { account: "498283327683", region: "us-east-1" }
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::CodeBuild::Project", {
      Name: "signal-tracker-prod-validate",
      Source: Match.objectLike({
        BuildSpec:
          "apps/analysis/signal-tracker/signal-tracker-infra/buildspec.validate.yml",
        Type: "CODEPIPELINE"
      })
    });

    template.hasResourceProperties("AWS::CodeBuild::Project", {
      Name: "signal-tracker-prod-deploy",
      Source: Match.objectLike({
        BuildSpec:
          "apps/analysis/signal-tracker/signal-tracker-infra/buildspec.prod.yml",
        Type: "CODEPIPELINE"
      })
    });

    template.hasResourceProperties("AWS::CodeBuild::Project", {
      Name: "signal-tracker-prod-emit-urls",
      Environment: Match.objectLike({
        EnvironmentVariables: Match.arrayWith([
          Match.objectLike({
            Name: "STACK_NAME",
            Type: "PLAINTEXT",
            Value: "SignalTrackerStack"
          })
        ])
      })
    });

    template.hasResourceProperties("AWS::CodePipeline::Pipeline", {
      Name: "signal-tracker-prod",
      Stages: Match.arrayWith([
        Match.objectLike({ Name: "Source" }),
        Match.objectLike({ Name: "Validate" }),
        Match.objectLike({
          Name: "Prod",
          Actions: Match.arrayWith([
            Match.objectLike({
              Name: "EmitUrls",
              Namespace: "ProdUrls",
              RunOrder: 2
            })
          ])
        })
      ])
    });

    template.hasResourceProperties("AWS::IAM::Role", {
      RoleName: "signal-tracker-prod-starter",
      AssumeRolePolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: "sts:AssumeRoleWithWebIdentity",
            Principal: Match.objectLike({
              Federated: Match.anyValue()
            })
          })
        ])
      })
    });
  });
});
