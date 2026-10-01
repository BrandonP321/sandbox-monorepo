import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";
import {
  WeddingPreviewStack,
  validatePreviewConfig,
  type WeddingPreviewConfig
} from "../lib/wedding-preview-stack.js";

const config: WeddingPreviewConfig = {
  id: "synthetic-task",
  account: "000000000000",
  region: "us-east-1",
  tableArn:
    "arn:aws:dynamodb:us-east-1:000000000000:table/synthetic-existing-table",
  deploymentRoleArn:
    "arn:aws:iam::000000000000:role/WeddingPreviewExecution-synthetic-task",
  boundaryArns: {
    Backend:
      "arn:aws:iam::000000000000:policy/WeddingPreview-synthetic-task-BackendBoundary",
    Frontend:
      "arn:aws:iam::000000000000:policy/WeddingPreview-synthetic-task-FrontendBoundary",
    Cleanup:
      "arn:aws:iam::000000000000:policy/WeddingPreview-synthetic-task-CleanupBoundary"
  },
  adminAccessKeySha256: "1".repeat(64),
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 86_399_000).toISOString(),
  sourceRevision: "a".repeat(40)
};
function template(
  phase: "api-only" | "full" = "full",
  overrides: Partial<WeddingPreviewConfig> = {}
) {
  const asset = mkdtempSync(join(tmpdir(), "wedding-preview-test-"));
  writeFileSync(
    join(asset, "index.js"),
    "exports.handler = async () => ({statusCode:401});"
  );
  return Template.fromStack(
    new WeddingPreviewStack(
      new App(),
      { ...config, ...overrides },
      {
        frontend: asset,
        backend: asset
      },
      {},
      phase
    )
  );
}
describe("separate read-only preview infrastructure", () => {
  it("creates an inert API first with identical final API identity and properties", () => {
    const initial = template("api-only").toJSON();
    const full = template().toJSON();
    expect(Object.keys(initial.Resources)).toEqual(["PreviewApiD1851C0B"]);
    expect(initial.Parameters?.BootstrapVersion).toBeUndefined();
    expect(full.Parameters?.BootstrapVersion).toBeUndefined();
    expect(full.Rules?.CheckBootstrapVersion).toBeUndefined();
    expect(initial.Resources.PreviewApiD1851C0B).toEqual(
      full.Resources.PreviewApiD1851C0B
    );
    expect(initial.Resources.PreviewApiD1851C0B.Properties.Name).toBe(
      "WeddingPreview-synthetic-task"
    );
  });
  it("attaches distinct external boundaries and deterministic names without owning policies", () => {
    const result = template();
    for (const kind of ["Backend", "Frontend", "Cleanup"] as const)
      result.hasResourceProperties("AWS::IAM::Role", {
        RoleName: `WeddingPreview-synthetic-task-${kind}`,
        PermissionsBoundary: config.boundaryArns[kind]
      });
    result.resourceCountIs("AWS::IAM::ManagedPolicy", 0);
    result.hasResourceProperties("AWS::Scheduler::Schedule", {
      Name: "WeddingPreview-synthetic-task-Expiry",
      GroupName: "default"
    });
    for (const kind of ["Backend", "Frontend"]) {
      result.hasResourceProperties("AWS::Lambda::Function", {
        FunctionName: `WeddingPreview-synthetic-task-${kind}`
      });
      result.hasResourceProperties("AWS::Logs::LogGroup", {
        LogGroupName: `/aws/lambda/WeddingPreview-synthetic-task-${kind}`
      });
    }
  });
  it("removes the schedule before its role and inline policy, keeping external execution available", () => {
    const result = template().toJSON();
    expect(result.Resources.ExpiryCleanup.DependsOn).toEqual(
      expect.arrayContaining([
        "CleanupRole9B76E1E6",
        "CleanupRoleDefaultPolicyF2E6A473"
      ])
    );
    expect(JSON.stringify(result.Resources)).not.toContain(
      "WeddingPreviewExecution-synthetic-task"
    );
  });
  it("allows explicit disabled admin mode without inventing a credential", () => {
    template("full", { adminAccessKeySha256: null }).hasResourceProperties(
      "AWS::Lambda::Function",
      {
        FunctionName: "WeddingPreview-synthetic-task-Backend",
        Environment: {
          Variables: Match.objectLike({
            ADMIN_ACCESS_KEY_SHA256: "0".repeat(64)
          })
        }
      }
    );
    expect(() =>
      validatePreviewConfig({ ...config, adminAccessKeySha256: null })
    ).not.toThrow();
  });
  it("routes one origin directly to two separately permissioned handlers", () => {
    const result = template();
    result.resourceCountIs("AWS::ApiGatewayV2::Api", 1);
    result.resourceCountIs("AWS::ApiGatewayV2::Stage", 1);
    result.resourceCountIs("AWS::ApiGatewayV2::Route", 2);
    result.resourceCountIs("AWS::ApiGatewayV2::Integration", 2);
    result.resourceCountIs("AWS::Lambda::Permission", 2);
    result.hasResourceProperties("AWS::ApiGatewayV2::Route", {
      RouteKey: "$default"
    });
    result.hasResourceProperties("AWS::ApiGatewayV2::Route", {
      RouteKey: "GET /api/admin/rsvps"
    });
    expect(Object.keys(result.toJSON().Resources)).toHaveLength(19);
    expect(JSON.stringify(result.toJSON())).not.toMatch(
      /Cognito|PREVIEW_ISSUER|PREVIEW_CLIENT_ID|PREVIEW_OWNER_SUB|LOGIN_ORIGIN|CallbackUrl/
    );
    const functions = Object.values(
      result.findResources("AWS::Lambda::Function")
    );
    const frontend = functions.find((resource) =>
      resource.Properties.FunctionName.endsWith("-Frontend")
    );
    expect(frontend?.Properties.Environment.Variables).not.toHaveProperty(
      "PREVIEW_BACKEND_ORIGIN"
    );
    expect(frontend?.Properties.Environment.Variables).not.toHaveProperty(
      "RSVP_TABLE_NAME"
    );
    expect(frontend?.Properties.Environment.Variables).not.toHaveProperty(
      "ADMIN_ACCESS_KEY_SHA256"
    );
    expect(
      JSON.stringify(result.findResources("AWS::IAM::Policy"))
    ).not.toContain("lambda:InvokeFunction");
  });
  it("rejects future-dated and already expired deployment windows", () => {
    const start = Date.parse(config.createdAt);
    expect(() => validatePreviewConfig(config, start - 1)).toThrow();
    expect(() =>
      validatePreviewConfig(config, Date.parse(config.expiresAt))
    ).toThrow();
    expect(() => validatePreviewConfig(config, start)).not.toThrow();
  });
  it("owns only preview runtime, endpoints, logs and expiry resources; never the table", () => {
    const result = template();
    result.resourceCountIs("AWS::Lambda::Function", 2);
    result.resourceCountIs("AWS::ApiGatewayV2::Api", 1);
    result.resourceCountIs("AWS::Logs::LogGroup", 2);
    result.resourceCountIs("AWS::Scheduler::Schedule", 1);
    const allowed = new Set([
      "AWS::Lambda::Function",
      "AWS::Lambda::Permission",
      "AWS::ApiGatewayV2::Api",
      "AWS::ApiGatewayV2::Stage",
      "AWS::ApiGatewayV2::Integration",
      "AWS::ApiGatewayV2::Route",
      "AWS::Logs::LogGroup",
      "AWS::IAM::Role",
      "AWS::IAM::Policy",
      "AWS::Scheduler::Schedule"
    ]);
    const resources = result.toJSON().Resources as Record<
      string,
      { Type: string }
    >;
    for (const resource of Object.values(resources))
      expect(allowed.has(resource.Type), resource.Type).toBe(true);
  });
  it("allows only Scan on the exact table and explicitly denies other table operations", () => {
    const result = template();
    result.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: "Allow",
            Action: "dynamodb:Scan",
            Resource: config.tableArn
          }),
          Match.objectLike({
            Effect: "Deny",
            NotAction: "dynamodb:Scan",
            Resource: "arn:aws:dynamodb:*:*:table/*"
          })
        ])
      }
    });
    const policies = JSON.stringify(result.findResources("AWS::IAM::Policy"));
    expect(policies).not.toContain("dynamodb:PutItem");
    expect(policies).not.toContain("dynamodb:DeleteTable");
    result.hasResourceProperties("AWS::Lambda::Function", {
      Environment: {
        Variables: Match.objectLike({
          RSVP_TABLE_NAME: "synthetic-existing-table"
        })
      }
    });
  });
  it("cleanup can request deletion of only its own stack and has no DynamoDB access", () => {
    const result = template();
    result.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: {
        Statement: Match.arrayWith([
          {
            Action: "cloudformation:DeleteStack",
            Effect: "Allow",
            Resource: { Ref: "AWS::StackId" }
          },
          { Action: "dynamodb:*", Effect: "Deny", Resource: "*" }
        ])
      }
    });
    result.hasResourceProperties("AWS::Scheduler::Schedule", {
      ScheduleExpression: `at(${config.expiresAt.slice(0, 19)})`,
      Target: Match.objectLike({
        Arn: "arn:aws:scheduler:::aws-sdk:cloudformation:deleteStack",
        Input: Match.anyValue(),
        RetryPolicy: { MaximumEventAgeInSeconds: 3600, MaximumRetryAttempts: 3 }
      })
    });
    for (const resource of Object.values(
      result.findResources("AWS::Logs::LogGroup")
    ))
      expect(resource.DeletionPolicy).toBe("Delete");
  });
  it("has no wildcard CORS, DNS, auth-pool mutations, deployment pipeline, or public bucket", () => {
    const result = template();
    for (const resource of Object.values(
      result.findResources("AWS::ApiGatewayV2::Api")
    ))
      expect(resource.Properties).not.toHaveProperty("CorsConfiguration");
    for (const resource of Object.values(
      result.findResources("AWS::Lambda::Function")
    ))
      expect(resource.Properties).not.toHaveProperty("FunctionUrlConfig");
    result.resourceCountIs("AWS::Cognito::UserPool", 0);
    result.resourceCountIs("AWS::Cognito::UserPoolClient", 0);
    result.resourceCountIs("AWS::Route53::RecordSet", 0);
    result.resourceCountIs("AWS::S3::Bucket", 0);
    result.resourceCountIs("AWS::DynamoDB::Table", 0);
    result.resourceCountIs("AWS::CodePipeline::Pipeline", 0);
  });
  it.each([
    { deploymentRoleArn: "arn:aws:iam::000000000000:role/sandbox-admin" },
    { boundaryArns: undefined },
    {
      boundaryArns: {
        ...config.boundaryArns,
        Backend: config.boundaryArns.Frontend
      }
    },
    { tableArn: "" },
    { tableArn: config.tableArn.replace("000000000000", "111111111111") },
    { tableArn: `${config.tableArn}/index/*` },
    { expiresAt: "2040-01-03T00:00:00Z" },
    { adminAccessKeySha256: "0".repeat(64) },
    { id: "WeddingWebsiteStack" }
  ])("rejects unsafe/incomplete configuration %j", (overrides) => {
    expect(() =>
      validatePreviewConfig({
        ...config,
        ...overrides
      } as unknown as WeddingPreviewConfig)
    ).toThrow();
  });
});
