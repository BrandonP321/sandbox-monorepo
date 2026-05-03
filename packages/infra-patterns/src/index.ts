import * as cdk from "aws-cdk-lib";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export {
  GitHubActionsCodePipelineDeploy,
  type GitHubActionsCodePipelineDeployProps
} from "./github-actions-codepipeline-deploy.js";

export class HttpLambdaApi extends Construct {
  public readonly httpApi: apigwv2.HttpApi;

  constructor(
    scope: Construct,
    id: string,
    props: {
      handler: lambdaNodejs.NodejsFunction;
      routes: { path: string; method: apigwv2.HttpMethod }[];
    }
  ) {
    super(scope, id);

    this.httpApi = new apigwv2.HttpApi(this, "HttpApi", {
      corsPreflight: {
        allowHeaders: ["content-type", "authorization"],
        allowMethods: [apigwv2.CorsHttpMethod.ANY],
        allowOrigins: ["*"]
      }
    });

    const integration = new integrations.HttpLambdaIntegration(
      "LambdaIntegration",
      props.handler
    );
    for (const route of props.routes) {
      this.httpApi.addRoutes({
        path: route.path,
        methods: [route.method],
        integration
      });
    }
  }
}

export class SpaSite extends Construct {
  public readonly distribution: cloudfront.Distribution;
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.bucket = new s3.Bucket(this, "SiteBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    this.distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultBehavior: { origin: new origins.S3Origin(this.bucket) },
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
    });
  }
}
