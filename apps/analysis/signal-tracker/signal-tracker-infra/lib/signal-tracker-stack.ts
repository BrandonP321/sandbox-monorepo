import * as path from "node:path";

import * as cdk from "aws-cdk-lib";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

import {
  GitHubActionsCodePipelineDeploy,
  HttpLambdaApi,
  importDomainFoundation,
  SpaSite,
  type HttpLambdaApiCustomDomainProps,
  type SpaSiteCustomDomainProps
} from "@repo/infra-patterns";
import { signalTrackerRouteList } from "@repo/signal-tracker-shared";

import {
  SignalTrackerDatabase,
  type SignalTrackerDatabaseCapacityMode
} from "./signal-tracker-database.js";

const signalTrackerHandlerTimeout = cdk.Duration.seconds(45);

export interface SignalTrackerStackProps extends cdk.StackProps {
  readonly apiCustomDomain?: HttpLambdaApiCustomDomainProps;
  readonly databaseCapacityMode?: SignalTrackerDatabaseCapacityMode;
  readonly useSharedDomain?: boolean;
  readonly webCustomDomain?: SpaSiteCustomDomainProps;
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
        deployBuildEnvironment: { computeMode: "lambda" },
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
        sourceActionName: "Source",
        validationBuildSpecPath:
          "apps/analysis/signal-tracker/signal-tracker-infra/buildspec.validate.yml"
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
          // TODO: Set this from deployment environment once a separate dev DB exists.
          SIGNAL_TRACKER_DB_STAGE: "prod"
        },
        bundling: { target: "node22" },
        // Keep the Lambda alive long enough for Aurora Serverless v2 resume
        // failures to reach route error mapping as PERSISTENCE_UNAVAILABLE.
        timeout: signalTrackerHandlerTimeout
      }
    );
    database.cluster.grantDataApiAccess(handler);
    database.cluster.secret!.grantRead(handler);

    const api = new HttpLambdaApi(this, "SignalTrackerApi", {
      customDomain:
        props?.apiCustomDomain ??
        (props?.useSharedDomain
          ? createSignalTrackerApiCustomDomain(this)
          : undefined),
      handler,
      routes: signalTrackerRouteList.map((route) => ({
        method: httpMethodByRouteMethod[route.method],
        path: route.path
      }))
    });

    new cdk.CfnOutput(this, "ApiBaseUrl", {
      value: api.apiBaseUrl
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
      customDomain:
        props?.webCustomDomain ??
        (props?.useSharedDomain
          ? createSignalTrackerWebCustomDomain(this)
          : undefined)
    });

    new cdk.CfnOutput(this, "WebUrl", {
      value: site.publicUrl
    });

    new cdk.CfnOutput(this, "WebBucketName", {
      value: site.bucket.bucketName
    });

    new cdk.CfnOutput(this, "WebDistributionId", {
      value: site.distribution.distributionId
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

function createSignalTrackerWebCustomDomain(
  scope: cdk.Stack
): SpaSiteCustomDomainProps {
  const foundation = importDomainFoundation(scope, "SignalTrackerWebDomain", {
    domainName: "bphillips.dev"
  });

  return {
    certificate: foundation.certificate,
    dns: { hostedZone: foundation.hostedZone },
    domainNames: [`signal-tracker.${foundation.domainName}`]
  };
}

function createSignalTrackerApiCustomDomain(
  scope: cdk.Stack
): HttpLambdaApiCustomDomainProps {
  const foundation = importDomainFoundation(scope, "SignalTrackerApiDomain", {
    domainName: "bphillips.dev"
  });

  return {
    certificate: foundation.certificate,
    dns: { hostedZone: foundation.hostedZone },
    domainName: `signal-tracker-api.${foundation.domainName}`
  };
}
