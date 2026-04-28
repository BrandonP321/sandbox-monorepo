import * as path from "node:path";

import * as cdk from "aws-cdk-lib";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

import { helloWorldRouteList } from "@repo/hello-world-shared";
import {
  GitHubActionsCodePipelineDeploy,
  HttpLambdaApi,
  SpaSite
} from "@repo/infra-patterns";

export class HelloWorldStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const deployPipeline = new GitHubActionsCodePipelineDeploy(
      this,
      "HelloWorldCiCd",
      {
        buildSpecPath:
          "apps/portfolio/hello-world/hello-world-infra/buildspec.prod.yml",
        connectionName: "hello-world-prod-source",
        deployBuildEnvironment: { computeMode: "lambda" },
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
      }
    );

    const httpMethodByRouteMethod = {
      POST: apigwv2.HttpMethod.POST
    } as const;

    const handler = new lambdaNodejs.NodejsFunction(this, "HelloWorldHandler", {
      entry: path.join(
        __dirname,
        "..",
        "..",
        "hello-world-api",
        "src",
        "lambda.ts"
      ),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      bundling: { target: "node22" }
    });

    const api = new HttpLambdaApi(this, "HelloWorldApi", {
      handler,
      routes: helloWorldRouteList.map((route) => ({
        method: httpMethodByRouteMethod[route.method],
        path: route.path
      }))
    });

    new cdk.CfnOutput(this, "ApiBaseUrl", {
      value: api.httpApi.apiEndpoint
    });

    const site = new SpaSite(this, "HelloWorldSite", {
      distPath: path.join(__dirname, "..", "..", "hello-world-web", "dist"),
      runtimeConfig: { apiBaseUrl: api.httpApi.apiEndpoint }
    });

    new cdk.CfnOutput(this, "WebUrl", {
      value: `https://${site.distribution.domainName}`
    });

    new cdk.CfnOutput(this, "HelloWorldDeployPipelineName", {
      value: deployPipeline.pipeline.pipelineName
    });

    new cdk.CfnOutput(this, "HelloWorldDeployProjectName", {
      value: deployPipeline.project.projectName
    });

    new cdk.CfnOutput(this, "HelloWorldGitHubActionsRoleArn", {
      value: deployPipeline.starterRole.roleArn
    });

    new cdk.CfnOutput(this, "HelloWorldGitHubConnectionArn", {
      value: deployPipeline.connection.attrConnectionArn
    });

    new cdk.CfnOutput(this, "HelloWorldGitHubConnectionStatus", {
      value: deployPipeline.connection.attrConnectionStatus
    });
  }
}
