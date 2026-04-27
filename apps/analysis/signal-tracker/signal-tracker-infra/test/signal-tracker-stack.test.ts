import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";

import { resolveSignalTrackerDatabaseCapacityMode } from "../lib/signal-tracker-database.js";
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

  it("creates the default Aurora PostgreSQL Serverless v2 database foundation", () => {
    const template = synthSignalTrackerStack();

    template.resourceCountIs("AWS::EC2::NatGateway", 0);

    template.hasResourceProperties("AWS::RDS::DBCluster", {
      DatabaseName: "signal_tracker",
      EnableHttpEndpoint: true,
      Engine: "aurora-postgresql",
      EngineVersion: "16.10",
      StorageEncrypted: true,
      BackupRetentionPeriod: 7,
      ServerlessV2ScalingConfiguration: {
        MinCapacity: 0,
        MaxCapacity: 2,
        SecondsUntilAutoPause: 600
      }
    });

    template.hasResource("AWS::RDS::DBCluster", {
      DeletionPolicy: "Snapshot",
      UpdateReplacePolicy: "Snapshot"
    });

    template.hasResourceProperties("AWS::RDS::DBInstance", {
      DBInstanceClass: "db.serverless",
      Engine: "aurora-postgresql",
      PubliclyAccessible: false
    });

    template.hasResourceProperties("AWS::Lambda::Function", {
      Environment: {
        Variables: Match.objectLike({
          SIGNAL_TRACKER_DB_NAME: "signal_tracker",
          SIGNAL_TRACKER_DB_RESOURCE_ARN: {
            "Fn::Join": Match.anyValue()
          },
          SIGNAL_TRACKER_DB_SECRET_ARN: {
            Ref: Match.anyValue()
          }
        })
      }
    });

    template.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: Match.arrayWith([
              "rds-data:BatchExecuteStatement",
              "rds-data:BeginTransaction",
              "rds-data:CommitTransaction",
              "rds-data:ExecuteStatement",
              "rds-data:RollbackTransaction"
            ]),
            Resource: Match.anyValue()
          }),
          Match.objectLike({
            Action: Match.arrayWith([
              "secretsmanager:GetSecretValue",
              "secretsmanager:DescribeSecret"
            ]),
            Resource: Match.anyValue()
          })
        ])
      })
    });

    template.hasOutput("SignalTrackerDatabaseName", {
      Value: "signal_tracker"
    });
    template.hasOutput("SignalTrackerDatabaseCapacityMode", {
      Value: "default"
    });
  });

  it("can synthesize recruiting capacity mode without auto-pause", () => {
    const template = synthSignalTrackerStack("recruiting");

    template.hasResourceProperties("AWS::RDS::DBCluster", {
      ServerlessV2ScalingConfiguration: {
        MinCapacity: 0.5,
        MaxCapacity: 2,
        SecondsUntilAutoPause: Match.absent()
      }
    });

    template.hasOutput("SignalTrackerDatabaseCapacityMode", {
      Value: "recruiting"
    });
  });

  it("resolves database capacity mode from CDK context", () => {
    const app = new cdk.App({
      context: { dbCapacityMode: "recruiting" }
    });

    expect(resolveSignalTrackerDatabaseCapacityMode(app)).toBe("recruiting");
  });
});

function synthSignalTrackerStack(
  databaseCapacityMode: "default" | "recruiting" = "default"
) {
  const app = new cdk.App();
  const stack = new SignalTrackerStack(app, "SignalTrackerStack", {
    databaseCapacityMode,
    env: { account: "498283327683", region: "us-east-1" }
  });

  return Template.fromStack(stack);
}
