import * as path from "node:path";

import * as cdk from "aws-cdk-lib";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

import { HttpLambdaApi, SpaSite } from "@repo/infra-patterns";
import { signalTrackerRouteList } from "@repo/signal-tracker-shared";

export class SignalTrackerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
        bundling: { target: "node22" }
      }
    );

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

    const site = new SpaSite(this, "SignalTrackerSite", {
      distPath: path.join(__dirname, "..", "..", "signal-tracker-web", "dist"),
      runtimeConfig: { apiBaseUrl: api.httpApi.apiEndpoint }
    });

    new cdk.CfnOutput(this, "WebUrl", {
      value: `https://${site.distribution.domainName}`
    });
  }
}
