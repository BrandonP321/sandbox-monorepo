import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { describe, it } from "vitest";

import { SpaSite } from "./index.js";

describe("SpaSite", () => {
  it("provisions static hosting without runtime config deployments", () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");

    new SpaSite(stack, "Site");

    const template = Template.fromStack(stack);

    template.resourceCountIs("Custom::CDKBucketDeployment", 0);
    template.resourceCountIs("AWS::S3::Bucket", 1);
    template.resourceCountIs("AWS::CloudFront::Distribution", 1);
  });
});
