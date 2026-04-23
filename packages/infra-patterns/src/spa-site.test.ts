import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { afterEach, describe, expect, it } from "vitest";

import { SpaSite } from "./index.js";

const tempDirs: string[] = [];

afterEach(() => {
  for (const tempDir of tempDirs) {
    fs.rmSync(tempDir, { force: true, recursive: true });
  }
  tempDirs.length = 0;
});

describe("SpaSite", () => {
  it("keeps root-level site and config deployments from pruning each other", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "spa-site-"));
    tempDirs.push(tempDir);
    fs.writeFileSync(path.join(tempDir, "index.html"), "<!doctype html>");

    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");

    new SpaSite(stack, "Site", {
      distPath: tempDir,
      runtimeConfig: { apiBaseUrl: "https://example.com" }
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties("Custom::CDKBucketDeployment", {
      DistributionPaths: ["/config.json"],
      Prune: false,
      SystemMetadata: Match.objectLike({
        "content-type": "application/json"
      })
    });

    template.hasResourceProperties("Custom::CDKBucketDeployment", {
      DistributionPaths: ["/*"],
      Prune: false
    });

    expect(template.findResources("Custom::CDKBucketDeployment")).toHaveProperty(
      Object.keys(template.findResources("Custom::CDKBucketDeployment"))[0]
    );
  });
});
