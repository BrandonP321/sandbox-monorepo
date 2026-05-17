import * as cdk from "aws-cdk-lib";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as route53 from "aws-cdk-lib/aws-route53";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";

import { HttpLambdaApi } from "./index.js";

describe("HttpLambdaApi", () => {
  it("uses the generated API Gateway endpoint by default", () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");
    const handler = lambda.Function.fromFunctionArn(
      stack,
      "Handler",
      "arn:aws:lambda:us-east-1:123456789012:function:test"
    );

    const api = new HttpLambdaApi(stack, "Api", {
      handler,
      routes: [{ method: apigwv2.HttpMethod.POST, path: "/get-health" }]
    });

    const template = Template.fromStack(stack);

    template.resourceCountIs("AWS::ApiGatewayV2::DomainName", 0);
    expect(api.apiBaseUrl).toBe(api.httpApi.apiEndpoint);
  });

  it("can attach a custom API domain and Route 53 alias", () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");
    const hostedZone = new route53.PublicHostedZone(stack, "HostedZone", {
      zoneName: "example.com"
    });
    const certificate = acm.Certificate.fromCertificateArn(
      stack,
      "Certificate",
      "arn:aws:acm:us-east-1:123456789012:certificate/example"
    );
    const handler = lambda.Function.fromFunctionArn(
      stack,
      "Handler",
      "arn:aws:lambda:us-east-1:123456789012:function:test"
    );

    const api = new HttpLambdaApi(stack, "Api", {
      customDomain: {
        certificate,
        dns: { hostedZone },
        domainName: "api.example.com"
      },
      handler,
      routes: [{ method: apigwv2.HttpMethod.POST, path: "/get-health" }]
    });

    const template = Template.fromStack(stack);

    expect(api.apiBaseUrl).toBe("https://api.example.com");
    template.hasResourceProperties("AWS::ApiGatewayV2::DomainName", {
      DomainName: "api.example.com",
      DomainNameConfigurations: Match.arrayWith([
        Match.objectLike({
          CertificateArn:
            "arn:aws:acm:us-east-1:123456789012:certificate/example"
        })
      ])
    });
    template.hasResourceProperties("AWS::ApiGatewayV2::ApiMapping", {
      ApiId: Match.anyValue(),
      DomainName: Match.anyValue()
    });
    template.hasResourceProperties("AWS::Route53::RecordSet", {
      Name: "api.example.com.",
      Type: "A"
    });
  });
});
