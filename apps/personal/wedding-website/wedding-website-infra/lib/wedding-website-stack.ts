import * as path from "node:path";

import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as route53 from "aws-cdk-lib/aws-route53";
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

const WEDDING_WEBSITE_CANONICAL_DOMAIN_NAME = "niamhandbrandon.com";
const WEDDING_WEBSITE_WWW_DOMAIN_NAME = "www.niamhandbrandon.com";
const WEDDING_WEBSITE_FALLBACK_DOMAIN_NAME = "wedding.bphillips.dev";
const WEDDING_WEBSITE_HOSTED_ZONE_ID = "Z02261718UO8QG9WU8KP";
const WEDDING_WEBSITE_API_DOMAIN_NAME = "wedding-api.bphillips.dev";
const UNCONFIGURED_ADMIN_ACCESS_KEY_SHA256 = "0".repeat(64);
const alarmPeriod = cdk.Duration.minutes(5);

export interface WeddingWebsiteStackProps extends cdk.StackProps {
  readonly adminAccessKeySha256?: string;
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

    const adminLambdaLogGroup = new logs.LogGroup(this, "AdminRsvpLambdaLogs", {
      retention: logs.RetentionDays.ONE_MONTH
    });
    const adminHandler = new lambdaNodejs.NodejsFunction(
      this,
      "AdminRsvpHandler",
      {
        entry: path.join(
          __dirname,
          "..",
          "..",
          "wedding-website-api",
          "src",
          "admin-lambda.ts"
        ),
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_24_X,
        bundling: { bundleAwsSDK: true, target: "node24" },
        environment: {
          ADMIN_ACCESS_KEY_SHA256:
            props?.adminAccessKeySha256 ?? UNCONFIGURED_ADMIN_ACCESS_KEY_SHA256,
          RSVP_TABLE_NAME: rsvpTable.tableName
        },
        logGroup: adminLambdaLogGroup,
        memorySize: 256,
        timeout: cdk.Duration.seconds(5)
      }
    );
    rsvpTable.grant(adminHandler, "dynamodb:Scan");

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
        allowHeaders: ["content-type", "idempotency-key", "authorization"],
        allowMethods: [apigwv2.CorsHttpMethod.POST, apigwv2.CorsHttpMethod.GET],
        allowOrigins: [
          `https://${WEDDING_WEBSITE_CANONICAL_DOMAIN_NAME}`,
          `https://${WEDDING_WEBSITE_FALLBACK_DOMAIN_NAME}`
        ]
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
    const adminIntegration = new integrations.HttpLambdaIntegration(
      "AdminRsvpLambdaIntegration",
      adminHandler
    );
    api.httpApi.addRoutes({
      path: weddingWebsiteRoutes.listAdminRsvps.path,
      methods: [apigwv2.HttpMethod.GET],
      integration: adminIntegration
    });

    createErrorAlarm(this, "RsvpLambdaErrors", handler.metricErrors());
    createErrorAlarm(
      this,
      "AdminRsvpLambdaErrors",
      adminHandler.metricErrors()
    );
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

    const siteCustomDomain =
      props?.customDomain ??
      (props?.useSharedDomain
        ? createWeddingWebsiteCustomDomain(this)
        : undefined);
    const canonicalRedirectFunction = siteCustomDomain
      ? createCanonicalRedirectFunction(this)
      : undefined;
    const site = new SpaSite(this, "WeddingWebsiteSite", {
      customDomain: siteCustomDomain,
      defaultBehavior: {
        functionAssociations: canonicalRedirectFunction
          ? [
              {
                eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
                function: canonicalRedirectFunction
              }
            ]
          : undefined,
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
  const fallbackFoundation = importDomainFoundation(
    scope,
    "WeddingWebsiteDomain",
    { domainName: "bphillips.dev" }
  );
  const canonicalHostedZone = route53.HostedZone.fromHostedZoneAttributes(
    scope,
    "WeddingWebsiteCanonicalHostedZone",
    {
      hostedZoneId: WEDDING_WEBSITE_HOSTED_ZONE_ID,
      zoneName: WEDDING_WEBSITE_CANONICAL_DOMAIN_NAME
    }
  );
  const certificate = new acm.Certificate(scope, "WeddingWebsiteCertificate", {
    domainName: WEDDING_WEBSITE_CANONICAL_DOMAIN_NAME,
    subjectAlternativeNames: [
      WEDDING_WEBSITE_WWW_DOMAIN_NAME,
      WEDDING_WEBSITE_FALLBACK_DOMAIN_NAME
    ],
    validation: acm.CertificateValidation.fromDnsMultiZone({
      [WEDDING_WEBSITE_CANONICAL_DOMAIN_NAME]: canonicalHostedZone,
      [WEDDING_WEBSITE_WWW_DOMAIN_NAME]: canonicalHostedZone,
      [WEDDING_WEBSITE_FALLBACK_DOMAIN_NAME]: fallbackFoundation.hostedZone
    })
  });

  return {
    certificate,
    dnsAliases: [
      {
        domainName: WEDDING_WEBSITE_CANONICAL_DOMAIN_NAME,
        hostedZone: canonicalHostedZone
      },
      {
        domainName: WEDDING_WEBSITE_WWW_DOMAIN_NAME,
        hostedZone: canonicalHostedZone
      },
      {
        domainName: WEDDING_WEBSITE_FALLBACK_DOMAIN_NAME,
        hostedZone: fallbackFoundation.hostedZone
      }
    ],
    domainNames: [
      WEDDING_WEBSITE_CANONICAL_DOMAIN_NAME,
      WEDDING_WEBSITE_WWW_DOMAIN_NAME,
      WEDDING_WEBSITE_FALLBACK_DOMAIN_NAME
    ]
  };
}

function createCanonicalRedirectFunction(
  scope: cdk.Stack
): cloudfront.Function {
  return new cloudfront.Function(scope, "WeddingWebsiteCanonicalRedirect", {
    code: cloudfront.FunctionCode.fromInline(`function handler(event) {
  var request = event.request;
  var hostHeader = request.headers.host;

  if (!hostHeader || hostHeader.value !== "${WEDDING_WEBSITE_WWW_DOMAIN_NAME}") {
    return request;
  }

  var queryString = request.rawQueryString();
  var querySuffix = queryString === undefined ? "" : "?" + queryString;

  return {
    statusCode: 301,
    statusDescription: "Moved Permanently",
    headers: {
      location: {
        value: "https://${WEDDING_WEBSITE_CANONICAL_DOMAIN_NAME}" + request.uri + querySuffix
      }
    }
  };
}`),
    runtime: cloudfront.FunctionRuntime.JS_2_0
  });
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
