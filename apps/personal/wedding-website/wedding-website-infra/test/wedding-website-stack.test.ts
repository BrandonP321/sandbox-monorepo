import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";

import { WeddingWebsiteStack } from "../lib/wedding-website-stack.js";

interface SynthesizedPipeline {
  readonly Properties: {
    readonly Stages: readonly {
      readonly Actions: readonly {
        readonly Configuration?: Record<string, unknown>;
        readonly Name: string;
      }[];
      readonly Name: string;
    }[];
  };
}

describe("WeddingWebsiteStack", () => {
  it("creates public hosting, the RSVP API, and one production pipeline", () => {
    const app = new cdk.App();
    const stack = new WeddingWebsiteStack(app, "WeddingWebsiteStack", {
      env: { account: "498283327683", region: "us-east-1" },
      useSharedDomain: true
    });
    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::S3::Bucket", {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true
      }
    });
    template.resourceCountIs("AWS::CloudFront::Distribution", 1);
    template.hasResourceProperties("AWS::CloudFront::Distribution", {
      DistributionConfig: Match.objectLike({
        Aliases: [
          "niamhandbrandon.com",
          "www.niamhandbrandon.com",
          "wedding.bphillips.dev"
        ],
        DefaultCacheBehavior: Match.objectLike({
          FunctionAssociations: [
            Match.objectLike({ EventType: "viewer-request" })
          ],
          ViewerProtocolPolicy: "redirect-to-https"
        }),
        ViewerCertificate: Match.objectLike({
          AcmCertificateArn: Match.anyValue()
        })
      })
    });
    template.resourceCountIs("AWS::CloudFront::Function", 1);
    template.hasResourceProperties("AWS::CloudFront::Function", {
      AutoPublish: true,
      FunctionConfig: Match.objectLike({ Runtime: "cloudfront-js-2.0" }),
      FunctionCode: Match.anyValue()
    });
    const redirectFunctions = Object.values(
      template.findResources("AWS::CloudFront::Function")
    ) as { Properties: { FunctionCode: string } }[];
    expect(redirectFunctions).toHaveLength(1);
    const redirectCode = redirectFunctions[0]!.Properties.FunctionCode;
    expect(redirectCode).toContain(
      'hostHeader.value !== "www.niamhandbrandon.com"'
    );
    expect(redirectCode).toContain("request.rawQueryString()");
    expect(redirectCode).toContain("statusCode: 301");
    expect(redirectCode).toContain(
      'value: "https://niamhandbrandon.com" + request.uri + querySuffix'
    );

    template.resourceCountIs("AWS::CertificateManager::Certificate", 1);
    template.hasResourceProperties("AWS::CertificateManager::Certificate", {
      DomainName: "niamhandbrandon.com",
      DomainValidationOptions: Match.arrayWith([
        {
          DomainName: "niamhandbrandon.com",
          HostedZoneId: "Z02261718UO8QG9WU8KP"
        },
        {
          DomainName: "www.niamhandbrandon.com",
          HostedZoneId: "Z02261718UO8QG9WU8KP"
        },
        {
          DomainName: "wedding.bphillips.dev",
          HostedZoneId: {
            "Fn::ImportValue": "sandbox-domain-hosted-zone-id"
          }
        }
      ]),
      SubjectAlternativeNames: [
        "www.niamhandbrandon.com",
        "wedding.bphillips.dev"
      ],
      ValidationMethod: "DNS"
    });
    template.resourcePropertiesCountIs(
      "AWS::Route53::RecordSet",
      {
        HostedZoneId: "Z02261718UO8QG9WU8KP",
        Name: "niamhandbrandon.com.",
        Type: "A"
      },
      1
    );
    template.resourcePropertiesCountIs(
      "AWS::Route53::RecordSet",
      {
        HostedZoneId: "Z02261718UO8QG9WU8KP",
        Name: "niamhandbrandon.com.",
        Type: "AAAA"
      },
      1
    );
    template.resourcePropertiesCountIs(
      "AWS::Route53::RecordSet",
      {
        HostedZoneId: "Z02261718UO8QG9WU8KP",
        Name: "www.niamhandbrandon.com.",
        Type: "A"
      },
      1
    );
    template.resourcePropertiesCountIs(
      "AWS::Route53::RecordSet",
      {
        HostedZoneId: "Z02261718UO8QG9WU8KP",
        Name: "www.niamhandbrandon.com.",
        Type: "AAAA"
      },
      1
    );
    template.resourcePropertiesCountIs(
      "AWS::Route53::RecordSet",
      { Name: "wedding.bphillips.dev.", Type: "A" },
      1
    );
    template.resourcePropertiesCountIs(
      "AWS::Route53::RecordSet",
      { Name: "wedding.bphillips.dev.", Type: "AAAA" },
      1
    );
    template.hasResourceProperties("AWS::Route53::RecordSet", {
      HostedZoneId: {
        "Fn::ImportValue": "sandbox-domain-hosted-zone-id"
      }
    });

    template.hasResourceProperties("AWS::DynamoDB::Table", {
      AttributeDefinitions: [{ AttributeName: "pk", AttributeType: "S" }],
      BillingMode: "PAY_PER_REQUEST",
      DeletionProtectionEnabled: true,
      KeySchema: [{ AttributeName: "pk", KeyType: "HASH" }],
      PointInTimeRecoverySpecification: {
        PointInTimeRecoveryEnabled: true
      }
    });
    template.hasResource("AWS::DynamoDB::Table", {
      DeletionPolicy: "Retain",
      UpdateReplacePolicy: "Retain"
    });
    const tableResources = Object.values(
      template.findResources("AWS::DynamoDB::Table")
    ) as { Properties: Record<string, unknown> }[];
    expect(tableResources).toHaveLength(1);
    expect(tableResources[0]?.Properties).not.toHaveProperty(
      "TimeToLiveSpecification"
    );
    expect(tableResources[0]?.Properties).not.toHaveProperty(
      "GlobalSecondaryIndexes"
    );
    expect(tableResources[0]?.Properties).not.toHaveProperty(
      "LocalSecondaryIndexes"
    );

    template.hasResourceProperties("AWS::Lambda::Function", {
      Environment: {
        Variables: { RSVP_TABLE_NAME: Match.anyValue() }
      },
      Handler: "index.handler",
      LoggingConfig: { LogGroup: Match.anyValue() },
      MemorySize: 256,
      Runtime: "nodejs24.x",
      Timeout: 5
    });
    const rsvpFunctions = Object.values(
      template.findResources("AWS::Lambda::Function")
    ).filter(
      (resource) =>
        (resource as { Properties?: { Runtime?: string } }).Properties
          ?.Runtime === "nodejs24.x"
    ) as { Properties: Record<string, unknown> }[];
    expect(rsvpFunctions).toHaveLength(2);
    for (const rsvpFunction of rsvpFunctions) {
      expect(rsvpFunction.Properties).not.toHaveProperty(
        "ReservedConcurrentExecutions"
      );
    }
    template.hasResourceProperties("AWS::Lambda::Function", {
      Environment: {
        Variables: {
          ADMIN_ACCESS_KEY_SHA256: "0".repeat(64),
          RSVP_TABLE_NAME: Match.anyValue()
        }
      },
      Handler: "index.handler",
      Runtime: "nodejs24.x"
    });
    template.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: {
        Statement: Match.arrayWith([
          {
            Action: "dynamodb:GetItem",
            Effect: "Allow",
            Resource: Match.anyValue()
          },
          {
            Action: "dynamodb:PutItem",
            Condition: {
              "ForAnyValue:StringEquals": {
                "dynamodb:EnclosingOperation": "TransactWriteItems"
              }
            },
            Effect: "Allow",
            Resource: Match.anyValue()
          }
        ]),
        Version: "2012-10-17"
      }
    });
    template.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: {
        Statement: Match.arrayWith([
          {
            Action: "dynamodb:Scan",
            Effect: "Allow",
            Resource: Match.anyValue()
          }
        ]),
        Version: "2012-10-17"
      }
    });

    const lambdaResources = template.findResources(
      "AWS::Lambda::Function"
    ) as Record<
      string,
      {
        Properties: {
          Environment?: { Variables?: Record<string, unknown> };
          Role: { "Fn::GetAtt": [string, string] };
          Runtime?: string;
        };
      }
    >;
    const nodeFunctions = Object.values(lambdaResources).filter(
      (resource) => resource.Properties.Runtime === "nodejs24.x"
    );
    const publicFunction = nodeFunctions.find(
      (resource) =>
        resource.Properties.Environment?.Variables?.ADMIN_ACCESS_KEY_SHA256 ===
        undefined
    );
    const adminFunction = nodeFunctions.find(
      (resource) =>
        resource.Properties.Environment?.Variables?.ADMIN_ACCESS_KEY_SHA256 !==
        undefined
    );
    expect(publicFunction).toBeDefined();
    expect(adminFunction).toBeDefined();

    const iamPolicies = Object.values(
      template.findResources("AWS::IAM::Policy")
    ) as {
      Properties: {
        PolicyDocument: unknown;
        Roles?: { Ref: string }[];
      };
    }[];
    function policiesForFunction(
      target: (typeof nodeFunctions)[number] | undefined
    ): string {
      const roleId = target?.Properties.Role["Fn::GetAtt"][0];
      return JSON.stringify(
        iamPolicies
          .filter((policy) =>
            policy.Properties.Roles?.some((role) => role.Ref === roleId)
          )
          .map((policy) => policy.Properties.PolicyDocument)
      );
    }
    const publicPolicies = policiesForFunction(publicFunction);
    const adminPolicies = policiesForFunction(adminFunction);
    expect(publicPolicies).toContain("dynamodb:GetItem");
    expect(publicPolicies).toContain("dynamodb:PutItem");
    expect(publicPolicies).not.toContain("dynamodb:Scan");
    expect(adminPolicies).toContain("dynamodb:Scan");
    for (const action of [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
      "dynamodb:Query"
    ]) {
      expect(adminPolicies).not.toContain(action);
    }

    template.resourceCountIs("AWS::ApiGatewayV2::Api", 1);
    template.hasResourceProperties("AWS::ApiGatewayV2::Api", {
      CorsConfiguration: {
        AllowCredentials: false,
        AllowHeaders: ["content-type", "idempotency-key", "authorization"],
        AllowMethods: ["POST", "GET"],
        AllowOrigins: [
          "https://niamhandbrandon.com",
          "https://wedding.bphillips.dev"
        ]
      },
      DisableExecuteApiEndpoint: true,
      ProtocolType: "HTTP"
    });
    template.resourceCountIs("AWS::ApiGatewayV2::Route", 2);
    template.hasResourceProperties("AWS::ApiGatewayV2::Route", {
      AuthorizationType: "NONE",
      RouteKey: "POST /rsvp"
    });
    template.hasResourceProperties("AWS::ApiGatewayV2::Route", {
      AuthorizationType: "NONE",
      RouteKey: "GET /admin/rsvps"
    });
    template.hasResourceProperties("AWS::ApiGatewayV2::Stage", {
      AccessLogSettings: {
        DestinationArn: Match.anyValue(),
        Format:
          '{"requestId":"$context.requestId","routeKey":"$context.routeKey","status":"$context.status","integrationStatus":"$context.integration.integrationStatus","latency":"$context.responseLatency"}'
      },
      AutoDeploy: true,
      DefaultRouteSettings: {
        ThrottlingBurstLimit: 10,
        ThrottlingRateLimit: 5
      },
      StageName: "$default"
    });
    template.hasResourceProperties("AWS::ApiGatewayV2::DomainName", {
      DomainName: "wedding-api.bphillips.dev",
      DomainNameConfigurations: [
        Match.objectLike({
          CertificateArn: {
            "Fn::ImportValue": "sandbox-domain-certificate-arn"
          }
        })
      ]
    });
    template.resourcePropertiesCountIs(
      "AWS::Route53::RecordSet",
      { Name: "wedding-api.bphillips.dev.", Type: "A" },
      1
    );

    template.resourcePropertiesCountIs(
      "AWS::Logs::LogGroup",
      { RetentionInDays: 30 },
      3
    );
    template.resourceCountIs("AWS::CloudWatch::Alarm", 3);
    for (const metricName of ["Errors", "5xx"]) {
      template.hasResourceProperties("AWS::CloudWatch::Alarm", {
        ComparisonOperator: "GreaterThanOrEqualToThreshold",
        DatapointsToAlarm: 2,
        EvaluationPeriods: 2,
        MetricName: metricName,
        Period: 300,
        Statistic: "Sum",
        Threshold: 1,
        TreatMissingData: "notBreaching"
      });
    }

    template.hasResourceProperties("AWS::CodeBuild::Project", {
      Name: "wedding-website-prod-deploy",
      Cache: { Type: "NO_CACHE" },
      Environment: Match.objectLike({
        ComputeType: "BUILD_LAMBDA_4GB",
        Image: "aws/codebuild/amazonlinux-x86_64-lambda-standard:nodejs24",
        Type: "LINUX_LAMBDA_CONTAINER"
      }),
      Source: Match.objectLike({
        BuildSpec:
          "apps/personal/wedding-website/wedding-website-infra/buildspec.prod.yml",
        Type: "CODEPIPELINE"
      })
    });
    template.hasResourceProperties("AWS::CodeBuild::Project", {
      Name: "wedding-website-prod-validate",
      Source: Match.objectLike({
        BuildSpec:
          "apps/personal/wedding-website/wedding-website-infra/buildspec.validate.yml",
        Type: "CODEPIPELINE"
      })
    });

    const pipelineResources = Object.values(
      template.findResources("AWS::CodePipeline::Pipeline")
    ) as SynthesizedPipeline[];
    expect(pipelineResources).toHaveLength(1);
    expect(
      pipelineResources[0]?.Properties.Stages.map((stage) => stage.Name)
    ).toEqual(["Source", "Validate", "Prod"]);
    expect(
      pipelineResources[0]?.Properties.Stages[0]?.Actions[0]
    ).toMatchObject({
      Name: "Source",
      Configuration: {
        BranchName: "main",
        DetectChanges: false,
        FullRepositoryId: "BrandonP321/sandbox-monorepo"
      }
    });

    template.hasResourceProperties("AWS::IAM::Role", {
      RoleName: "wedding-website-prod-starter",
      AssumeRolePolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Principal: Match.objectLike({
              Federated: {
                "Fn::ImportValue": "sandbox-github-actions-oidc-provider-arn"
              }
            })
          })
        ])
      })
    });

    template.resourceCountIs("AWS::IAM::OIDCProvider", 0);
    template.resourceCountIs("AWS::WAFv2::WebACL", 0);

    const synthesizedTemplate = JSON.stringify(template.toJSON());
    expect(synthesizedTemplate).not.toContain("PreviewPassword");
    expect(synthesizedTemplate).not.toContain("statusCode: 401");
    expect(synthesizedTemplate).not.toContain("www-authenticate");
    expect(synthesizedTemplate).not.toContain("dynamodb:Query");
    expect(synthesizedTemplate).not.toContain("dynamodb:UpdateItem");
    expect(synthesizedTemplate).not.toContain("dynamodb:DeleteItem");
    const stageResources = Object.values(
      template.findResources("AWS::ApiGatewayV2::Stage")
    ) as {
      Properties: { AccessLogSettings: { Format: string } };
    }[];
    const accessLogFormat =
      stageResources[0]?.Properties.AccessLogSettings.Format;
    expect(accessLogFormat).not.toContain("sourceIp");
    expect(accessLogFormat).not.toContain("userAgent");
    expect(accessLogFormat).not.toContain("header");
    expect(accessLogFormat).not.toContain("body");
    expect(accessLogFormat).not.toContain("idempotency");

    const outputs = template.toJSON().Outputs ?? {};
    expect(outputs).toHaveProperty("ApiBaseUrl", {
      Value: "https://wedding-api.bphillips.dev"
    });
    expect(outputs).toHaveProperty("WebUrl", {
      Value: "https://niamhandbrandon.com"
    });
    expect(outputs).toHaveProperty("RsvpTableName");
    expect(outputs).toHaveProperty("WebBucketName");
    expect(outputs).toHaveProperty("WebDistributionId");
  });

  it("deploys without preview-secret wiring", () => {
    const prodBuildspec = readFileSync(resolve("buildspec.prod.yml"), "utf8");
    const validateBuildspec = readFileSync(
      resolve("buildspec.validate.yml"),
      "utf8"
    );
    const packageJson = readFileSync(resolve("package.json"), "utf8");
    const workspacePackageJson = readFileSync(
      resolve("../../../../package.json"),
      "utf8"
    );

    expect(prodBuildspec).toContain("deploy:ci:no-build");
    expect(prodBuildspec).toContain("@repo/wedding-website-shared");
    expect(prodBuildspec).toContain("wedding-website-api");
    expect(prodBuildspec).toContain("wedding-website-infra");
    expect(prodBuildspec).toContain("ApiBaseUrl");
    expect(prodBuildspec).toContain("RsvpTableName");
    expect(prodBuildspec).toContain("API_BASE_URL");
    expect(prodBuildspec).toContain("RSVP_TABLE_NAME");
    for (const packageName of [
      "@repo/wedding-website-shared",
      "wedding-website-api",
      "wedding-website-web",
      "wedding-website-infra"
    ]) {
      expect(validateBuildspec).toContain(packageName);
    }
    expect(packageJson).not.toContain("--skip-api-base-url");
    expect(packageJson).toContain('"diff": "cdk diff --no-change-set"');
    expect(workspacePackageJson).toContain('"esbuild": "^0.25.10"');
    expect(prodBuildspec).not.toContain("secrets-manager");
    expect(prodBuildspec).not.toContain("WEDDING_PREVIEW_PASSWORD");
    expect(prodBuildspec).not.toContain("preview-password");
  });

  it("can temporarily enable the generated endpoint for staged verification", () => {
    const app = new cdk.App();
    const stack = new WeddingWebsiteStack(app, "WeddingWebsiteStack", {
      disableExecuteApiEndpoint: false,
      env: { account: "498283327683", region: "us-east-1" },
      useSharedDomain: true
    });
    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::ApiGatewayV2::Api", {
      DisableExecuteApiEndpoint: false
    });
  });

  it("supports the intended RSVP concurrency reservation after the quota increases", () => {
    const app = new cdk.App();
    const stack = new WeddingWebsiteStack(app, "WeddingWebsiteStack", {
      env: { account: "498283327683", region: "us-east-1" },
      rsvpReservedConcurrency: 5,
      useSharedDomain: true
    });
    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::Lambda::Function", {
      ReservedConcurrentExecutions: 5,
      Runtime: "nodejs24.x"
    });
  });
});
