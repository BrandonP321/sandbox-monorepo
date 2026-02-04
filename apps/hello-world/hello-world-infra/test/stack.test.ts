import { describe, it } from "vitest";
import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";

import { HelloWorldStack } from "../lib/hello-world-stack";

describe("HelloWorldStack", () => {
  it("defines API routes and outputs", () => {
    const app = new App();
    const stack = new HelloWorldStack(app, "TestStack");
    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::ApiGatewayV2::Route", {
      RouteKey: "GET /hello"
    });

    template.hasResourceProperties("AWS::ApiGatewayV2::Route", {
      RouteKey: "GET /healthz"
    });

    template.hasOutput("ApiBaseUrl", {});

    template.hasOutput("WebUrl", {});
  });
});
