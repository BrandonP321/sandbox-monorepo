import * as path from "node:path";

import * as cdk from "aws-cdk-lib";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

import {
  GitHubActionsCodePipelineDeploy,
  HttpLambdaApi,
  SpaSite
} from "@repo/infra-patterns";
import { signalTrackerRouteList } from "@repo/signal-tracker-shared";

import {
  SignalTrackerDatabase,
  type SignalTrackerDatabaseCapacityMode
} from "./signal-tracker-database.js";

export interface SignalTrackerStackProps extends cdk.StackProps {
  readonly databaseCapacityMode?: SignalTrackerDatabaseCapacityMode;
}

export class SignalTrackerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: SignalTrackerStackProps) {
    super(scope, id, props);

    const databaseCapacityMode = props?.databaseCapacityMode ?? "default";

    const deployPipeline = new GitHubActionsCodePipelineDeploy(
      this,
      "SignalTrackerCiCd",
      {
        buildSpecPath:
          "apps/analysis/signal-tracker/signal-tracker-infra/buildspec.prod.yml",
        connectionName: "signal-tracker-prod-source",
        deployStackName: "SignalTrackerStack",
        githubActionsBranch: "main",
        githubActionsRepo: "BrandonP321/sandbox-monorepo",
        githubOidcProviderArn: cdk.Arn.format(
          {
            service: "iam",
            region: "",
            account: cdk.Stack.of(this).account,
            resource: "oidc-provider",
            resourceName: "token.actions.githubusercontent.com"
          },
          this
        ),
        githubBranch: "main",
        githubOwner: "BrandonP321",
        githubRepo: "sandbox-monorepo",
        pipelineName: "signal-tracker-prod",
        projectName: "signal-tracker-prod-deploy",
        region: "us-east-1",
        sourceActionName: "Source"
      }
    );

    const database = new SignalTrackerDatabase(this, "SignalTrackerDatabase", {
      capacityMode: databaseCapacityMode
    });

    const httpMethodByRouteMethod = {
      POST: apigwv2.HttpMethod.POST
    } as const;

    const handler = new lambdaNodejs.NodejsFunction(
      this,
      "SignalTrackerHandler",
      {
        entry: path.join(
          __dirname,
          "..",
          "..",
          "signal-tracker-api",
          "src",
          "lambda.ts"
        ),
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_22_X,
        environment: {
          SIGNAL_TRACKER_DB_NAME: database.databaseName,
          SIGNAL_TRACKER_DB_RESOURCE_ARN: database.cluster.clusterArn,
          SIGNAL_TRACKER_DB_SECRET_ARN: database.cluster.secret!.secretArn
        },
        bundling: { target: "node22" }
      }
    );
    database.cluster.grantDataApiAccess(handler);
    database.cluster.secret!.grantRead(handler);

    const api = new HttpLambdaApi(this, "SignalTrackerApi", {
      handler,
      routes: signalTrackerRouteList.map((route) => ({
        method: httpMethodByRouteMethod[route.method],
        path: route.path
      }))
    });

    new cdk.CfnOutput(this, "ApiBaseUrl", {
      value: api.httpApi.apiEndpoint
    });

    new cdk.CfnOutput(this, "SignalTrackerDatabaseName", {
      value: database.databaseName
    });

    new cdk.CfnOutput(this, "SignalTrackerDatabaseResourceArn", {
      value: database.cluster.clusterArn
    });

    new cdk.CfnOutput(this, "SignalTrackerDatabaseSecretArn", {
      value: database.cluster.secret!.secretArn
    });

    new cdk.CfnOutput(this, "SignalTrackerDatabaseCapacityMode", {
      value: databaseCapacityMode
    });

    const site = new SpaSite(this, "SignalTrackerSite", {
      distPath: path.join(__dirname, "..", "..", "signal-tracker-web", "dist"),
      runtimeConfig: { apiBaseUrl: api.httpApi.apiEndpoint }
    });

    new cdk.CfnOutput(this, "WebUrl", {
      value: `https://${site.distribution.domainName}`
    });

    new cdk.CfnOutput(this, "SignalTrackerDeployPipelineName", {
      value: deployPipeline.pipeline.pipelineName
    });

    new cdk.CfnOutput(this, "SignalTrackerDeployProjectName", {
      value: deployPipeline.project.projectName
    });

    new cdk.CfnOutput(this, "SignalTrackerGitHubActionsRoleArn", {
      value: deployPipeline.starterRole.roleArn
    });

    new cdk.CfnOutput(this, "SignalTrackerGitHubConnectionArn", {
      value: deployPipeline.connection.attrConnectionArn
    });

    new cdk.CfnOutput(this, "SignalTrackerGitHubConnectionStatus", {
      value: deployPipeline.connection.attrConnectionStatus
    });
  }
}
