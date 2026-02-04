import * as fs from "node:fs";
import * as path from "node:path";

import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";

export class HelloWorldStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new lambdaNodejs.NodejsFunction(this, "HelloWorldHandler", {
      entry: path.join(
        __dirname,
        "..",
        "..",
        "hello-world-api",
        "src",
        "handler.ts"
      ),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      bundling: {
        target: "node22"
      }
    });

    const httpApi = new apigwv2.HttpApi(this, "HelloWorldApi", {
      corsPreflight: {
        allowHeaders: ["content-type"],
        allowMethods: [apigwv2.CorsHttpMethod.GET, apigwv2.CorsHttpMethod.OPTIONS],
        allowOrigins: ["*"]
      }
    });

    const integration = new integrations.HttpLambdaIntegration(
      "HelloWorldIntegration",
      handler
    );

    httpApi.addRoutes({
      path: "/hello",
      methods: [apigwv2.HttpMethod.GET],
      integration
    });

    httpApi.addRoutes({
      path: "/healthz",
      methods: [apigwv2.HttpMethod.GET],
      integration
    });

    new cdk.CfnOutput(this, "ApiBaseUrl", {
      value: httpApi.apiEndpoint
    });

    const distPath = path.join(
      __dirname,
      "..",
      "..",
      "hello-world-web",
      "dist"
    );
    const hasDist = fs.existsSync(distPath);

    if (!hasDist) {
      cdk.Annotations.of(this).addWarning(
        "Static site not deployed because hello-world-web/dist is missing. " +
          "Run `pnpm --filter hello-world-web build` before `cdk deploy` to enable it."
      );
    } else {
      const siteBucket = new s3.Bucket(this, "HelloWorldSiteBucket", {
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        encryption: s3.BucketEncryption.S3_MANAGED,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true
      });

      const distribution = new cloudfront.Distribution(
        this,
        "HelloWorldDistribution",
        {
          defaultBehavior: {
            origin: new origins.S3Origin(siteBucket)
          },
          defaultRootObject: "index.html",
          errorResponses: [
            {
              httpStatus: 403,
              responseHttpStatus: 200,
              responsePagePath: "/index.html"
            },
            {
              httpStatus: 404,
              responseHttpStatus: 200,
              responsePagePath: "/index.html"
            }
          ]
        }
      );

      new s3deploy.BucketDeployment(this, "HelloWorldSiteDeployment", {
        sources: [s3deploy.Source.asset(distPath)],
        destinationBucket: siteBucket,
        distribution,
        distributionPaths: ["/*"]
      });

      new cdk.CfnOutput(this, "WebUrl", {
        value: `https://${distribution.domainName}`
      });
    }
  }
}
