import * as path from "node:path";

import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

import {
  GitHubActionsCodePipelineDeploy,
  HttpLambdaApi,
  importGitHubActionsOidcProviderArn,
  importDomainFoundation,
  SpaSite,
  type HttpLambdaApiCustomDomainProps,
  type SpaSiteCustomDomainProps
} from "@repo/infra-patterns";
import { weddingWebsiteRoutes } from "@repo/wedding-website-shared";

const WEDDING_WEBSITE_DOMAIN_NAME = "wedding.bphillips.dev";
const WEDDING_WEBSITE_API_DOMAIN_NAME = "wedding-api.bphillips.dev";
const alarmPeriod = cdk.Duration.minutes(5);

export interface WeddingWebsiteStackProps extends cdk.StackProps {
  readonly apiCustomDomain?: HttpLambdaApiCustomDomainProps;
  readonly customDomain?: SpaSiteCustomDomainProps;
  readonly disableExecuteApiEndpoint?: boolean;
  readonly rsvpReservedConcurrency?: number;
  readonly useSharedDomain?: boolean;
}

export class WeddingWebsiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: WeddingWebsiteStackProps) {
    super(scope, id, props);

    const deployPipeline = new GitHubActionsCodePipelineDeploy(
      this,
      "WeddingWebsiteCiCd",
      {
        buildSpecPath:
          "apps/personal/wedding-website/wedding-website-infra/buildspec.prod.yml",
        connectionName: "wedding-website-prod-source",
        deployBuildEnvironment: { computeMode: "lambda" },
        deployStackName: "WeddingWebsiteStack",
        githubActionsBranch: "main",
        githubActionsRepo: "BrandonP321/sandbox-monorepo",
        githubOidcProviderArn: importGitHubActionsOidcProviderArn(),
        githubBranch: "main",
        githubOwner: "BrandonP321",
        githubRepo: "sandbox-monorepo",
        pipelineName: "wedding-website-prod",
        projectName: "wedding-website-prod-deploy",
        region: "us-east-1",
        sourceActionName: "Source",
        validationBuildSpecPath:
          "apps/personal/wedding-website/wedding-website-infra/buildspec.validate.yml"
      }
    );

    const rsvpTable = new dynamodb.Table(this, "RsvpTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      deletionProtection: true,
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    const lambdaLogGroup = new logs.LogGroup(this, "RsvpLambdaLogs", {
      retention: logs.RetentionDays.ONE_MONTH
    });
    const handler = new lambdaNodejs.NodejsFunction(this, "RsvpHandler", {
      entry: path.join(
        __dirname,
        "..",
        "..",
        "wedding-website-api",
        "src",
        "lambda.ts"
      ),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_24_X,
      bundling: { bundleAwsSDK: true, target: "node24" },
      environment: { RSVP_TABLE_NAME: rsvpTable.tableName },
      logGroup: lambdaLogGroup,
      memorySize: 256,
      reservedConcurrentExecutions: props?.rsvpReservedConcurrency,
      timeout: cdk.Duration.seconds(5)
    });
    rsvpTable.grant(handler, "dynamodb:GetItem");
    handler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["dynamodb:PutItem"],
        conditions: {
          "ForAnyValue:StringEquals": {
            "dynamodb:EnclosingOperation": "TransactWriteItems"
          }
        },
        resources: [rsvpTable.tableArn]
      })
    );

    const apiLogGroup = new logs.LogGroup(this, "RsvpApiAccessLogs", {
      retention: logs.RetentionDays.ONE_MONTH
    });
    const apiCustomDomain =
      props?.apiCustomDomain ??
      (props?.useSharedDomain
        ? createWeddingWebsiteApiCustomDomain(this)
        : undefined);
    const api = new HttpLambdaApi(this, "WeddingWebsiteApi", {
      corsPreflight: {
        allowCredentials: false,
        allowHeaders: ["content-type", "idempotency-key"],
        allowMethods: [apigwv2.CorsHttpMethod.POST],
        allowOrigins: [`https://${WEDDING_WEBSITE_DOMAIN_NAME}`]
      },
      customDomain: apiCustomDomain,
      defaultStageOptions: {
        accessLogSettings: {
          destination: new apigwv2.LogGroupLogDestination(apiLogGroup),
          format: apigateway.AccessLogFormat.custom(
            JSON.stringify({
              requestId: "$context.requestId",
              routeKey: "$context.routeKey",
              status: "$context.status",
              integrationStatus: "$context.integration.integrationStatus",
              latency: "$context.responseLatency"
            })
          )
        },
        throttle: { burstLimit: 10, rateLimit: 5 }
      },
      disableExecuteApiEndpoint:
        props?.disableExecuteApiEndpoint ?? apiCustomDomain !== undefined,
      handler,
      routes: [
        {
          method: apigwv2.HttpMethod.POST,
          path: weddingWebsiteRoutes.createRsvpSubmission.path
        }
      ]
    });

    createErrorAlarm(this, "RsvpLambdaErrors", handler.metricErrors());
    createErrorAlarm(
      this,
      "RsvpApiServerErrors",
      api.httpApi.metricServerError()
    );

    new cdk.CfnOutput(this, "ApiBaseUrl", {
      value: api.apiBaseUrl
    });

    new cdk.CfnOutput(this, "RsvpTableName", {
      value: rsvpTable.tableName
    });

    const site = new SpaSite(this, "WeddingWebsiteSite", {
      customDomain:
        props?.customDomain ??
        (props?.useSharedDomain
          ? createWeddingWebsiteCustomDomain(this)
          : undefined),
      defaultBehavior: {
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      }
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

    new cdk.CfnOutput(this, "WeddingWebsiteDeployPipelineName", {
      value: deployPipeline.pipeline.pipelineName
    });

    new cdk.CfnOutput(this, "WeddingWebsiteDeployProjectName", {
      value: deployPipeline.project.projectName
    });

    new cdk.CfnOutput(this, "WeddingWebsiteGitHubActionsRoleArn", {
      value: deployPipeline.starterRole.roleArn
    });

    new cdk.CfnOutput(this, "WeddingWebsiteGitHubConnectionArn", {
      value: deployPipeline.connection.attrConnectionArn
    });

    new cdk.CfnOutput(this, "WeddingWebsiteGitHubConnectionStatus", {
      value: deployPipeline.connection.attrConnectionStatus
    });
  }
}

function createWeddingWebsiteCustomDomain(
  scope: cdk.Stack
): SpaSiteCustomDomainProps {
  const foundation = importDomainFoundation(scope, "WeddingWebsiteDomain", {
    domainName: "bphillips.dev"
  });

  return {
    certificate: foundation.certificate,
    dns: { hostedZone: foundation.hostedZone },
    domainNames: [WEDDING_WEBSITE_DOMAIN_NAME]
  };
}

function createWeddingWebsiteApiCustomDomain(
  scope: cdk.Stack
): HttpLambdaApiCustomDomainProps {
  const foundation = importDomainFoundation(scope, "WeddingWebsiteApiDomain", {
    domainName: "bphillips.dev"
  });

  return {
    certificate: foundation.certificate,
    dns: { hostedZone: foundation.hostedZone },
    domainName: WEDDING_WEBSITE_API_DOMAIN_NAME
  };
}

function createErrorAlarm(
  scope: cdk.Stack,
  id: string,
  metric: cloudwatch.Metric
): cloudwatch.Alarm {
  return new cloudwatch.Alarm(scope, id, {
    comparisonOperator:
      cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    datapointsToAlarm: 2,
    evaluationPeriods: 2,
    metric: metric.with({ period: alarmPeriod, statistic: "Sum" }),
    threshold: 1,
    treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
  });
}
