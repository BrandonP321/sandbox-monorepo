import { describe, expect, it } from "vitest";
import {
  previewResourceTypes,
  bootstrapPolicy,
  deploymentPolicies,
  previewNames,
  assertSafeChangeSet,
  type ResolvedDeployment,
  type Policy
} from "../lib/wedding-preview-deployment.js";
const input: ResolvedDeployment = {
  id: "synthetic-task",
  account: "000000000000",
  region: "us-east-1",
  apiId: "abc123def4",
  stackArn:
    "arn:aws:cloudformation:us-east-1:000000000000:stack/WeddingPreview-synthetic-task/00000000-0000-4000-8000-000000000001",
  tableArn:
    "arn:aws:dynamodb:us-east-1:000000000000:table/synthetic-existing-table",
  assetKeys: {
    Backend: `${"a".repeat(64)}.zip`,
    Frontend: `${"b".repeat(64)}.zip`
  },
  assetKmsKeyArn:
    "arn:aws:kms:us-east-1:000000000000:key/00000000-0000-4000-8000-000000000002",
  assetBucketKeyEnabled: false
};
const allows = (p: Policy) => p.Statement.filter((s) => s.Effect === "Allow");
const actions = (p: Policy) =>
  allows(p).flatMap((s) =>
    typeof s.Action === "string" ? [s.Action] : (s.Action ?? [])
  );
const resourcesFor = (p: Policy, action: string) =>
  allows(p)
    .filter((s) =>
      (typeof s.Action === "string" ? [s.Action] : (s.Action ?? [])).includes(
        action
      )
    )
    .flatMap((s) => s.Resource);
describe("preview deployment authority", () => {
  it("bounds data reads even if the runtime inline policy is accidentally broadened", () => {
    const { boundaries } = deploymentPolicies(input);
    expect(actions(boundaries.Backend).sort()).toEqual(
      ["dynamodb:Scan", "logs:CreateLogStream", "logs:PutLogEvents"].sort()
    );
    expect(resourcesFor(boundaries.Backend, "dynamodb:Scan")).toEqual([
      input.tableArn
    ]);
    expect(actions(boundaries.Frontend).sort()).toEqual(
      ["logs:CreateLogStream", "logs:PutLogEvents"].sort()
    );
    expect(actions(boundaries.Cleanup)).toEqual(["cloudformation:DeleteStack"]);
    expect(
      resourcesFor(boundaries.Cleanup, "cloudformation:DeleteStack")
    ).toEqual([input.stackArn]);
    for (const p of Object.values(boundaries))
      expect(
        actions(p).some((a) =>
          /PutItem|DeleteTable|UpdateItem|BatchWrite|TransactWrite|iam:|s3:|lambda:/.test(
            a
          )
        )
      ).toBe(false);
  });
  it("cannot grant unbounded roles or alter boundaries, shared roles or its own authority", () => {
    const { execution, names } = deploymentPolicies(input);
    for (const kind of ["Backend", "Frontend", "Cleanup"] as const)
      expect(execution.Statement).toContainEqual({
        Effect: "Allow",
        Action: "iam:CreateRole",
        Resource: names.roleArns[kind],
        Condition: {
          StringEquals: { "iam:PermissionsBoundary": names.boundaryArns[kind] }
        }
      });
    for (const action of [
      "iam:AttachRolePolicy",
      "iam:PutRolePermissionsBoundary",
      "iam:DeleteRolePermissionsBoundary",
      "iam:CreatePolicyVersion",
      "iam:UpdateAssumeRolePolicy",
      "sts:AssumeRole"
    ])
      expect(actions(execution)).not.toContain(action);
    const iamResources = allows(execution)
      .filter((s) => JSON.stringify(s.Action).includes("iam:"))
      .flatMap((s) => s.Resource);
    expect(new Set(iamResources)).toEqual(
      new Set(Object.values(names.roleArns))
    );
    expect(iamResources).not.toContain(names.executionRoleArn);
    expect(execution.Statement).toContainEqual({
      Effect: "Deny",
      Action: "dynamodb:*",
      Resource: "*"
    });
  });
  it("has no production/shared bucket deletion path and no broadly scoped final write", () => {
    const { execution, publisher } = deploymentPolicies(input);
    expect(actions(execution).filter((a) => a.startsWith("dynamodb:"))).toEqual(
      []
    );
    expect(actions(execution).filter((a) => a.startsWith("s3:"))).toEqual([
      "s3:GetObject",
      "s3:GetObjectVersion",
      "s3:GetBucketLocation"
    ]);
    expect(actions(publisher)).not.toContain("s3:DeleteObject");
    expect(actions(execution)).not.toContain("cloudformation:DeleteStack");
    expect(
      allows(execution)
        .filter((s) => s.Resource === "*")
        .map((s) => s.Action)
    ).toEqual(["logs:DescribeLogGroups"]);
    for (const s of allows(execution).filter((s) =>
      JSON.stringify(s.Action).includes("apigateway:")
    ))
      for (const resource of [s.Resource].flat())
        expect(resource).toContain(`/apis/${input.apiId}`);
    expect(resourcesFor(execution, "scheduler:DeleteSchedule")).toEqual([
      "arn:aws:scheduler:us-east-1:000000000000:schedule/default/WeddingPreview-synthetic-task-Expiry"
    ]);
  });
  it("permits only the two reviewed encrypted zip objects with S3-mediated KMS", () => {
    const { execution, names } = deploymentPolicies(input);
    expect(resourcesFor(execution, "s3:GetObject")).toEqual(
      Object.values(input.assetKeys).map(
        (k) => `arn:aws:s3:::${names.bucket}/${k}`
      )
    );
    expect(
      execution.Statement.find((s) => s.Action === "kms:Decrypt")
    ).toMatchObject({
      Resource: input.assetKmsKeyArn,
      Condition: {
        StringEquals: {
          "kms:ViaService": "s3.us-east-1.amazonaws.com",
          "kms:CallerAccount": input.account,
          "kms:EncryptionContext:aws:s3:arn": resourcesFor(
            execution,
            "s3:GetObject"
          )
        }
      }
    });
    const withBucketKey = deploymentPolicies({
      ...input,
      assetBucketKeyEnabled: true
    });
    expect(
      withBucketKey.execution.Statement.find((s) => s.Action === "kms:Decrypt")
        ?.Condition?.StringEquals["kms:EncryptionContext:aws:s3:arn"]
    ).toBe(`arn:aws:s3:::${names.bucket}`);
  });
  it("passes only Lambda roles to Lambda and cleanup role to Scheduler", () => {
    const { execution, names } = deploymentPolicies(input);
    const pass = execution.Statement.filter((s) => s.Action === "iam:PassRole");
    expect(pass).toHaveLength(2);
    expect(pass[0]).toMatchObject({
      Resource: [names.roleArns.Backend, names.roleArns.Frontend],
      Condition: {
        StringEquals: { "iam:PassedToService": "lambda.amazonaws.com" }
      }
    });
    expect(pass[1]).toMatchObject({
      Resource: names.roleArns.Cleanup,
      Condition: {
        StringEquals: { "iam:PassedToService": "scheduler.amazonaws.com" }
      }
    });
  });
  it("bootstrap API root patterns cannot match tagged child stages", () => {
    const p = bootstrapPolicy(input);
    for (const statement of allows(p).filter(
      (s) => s.Resource !== "arn:aws:apigateway:us-east-1::/apis"
    )) {
      for (const pattern of [statement.Resource].flat()) {
        const expression = new RegExp(
          "^" +
            pattern
              .split("?")
              .map((part) => part.replace(/[.*+^${}()|[\]\\]/g, "\\$&"))
              .join(".") +
            "$"
        );
        expect(
          expression.test(pattern.replace("??????????", input.apiId))
        ).toBe(true);
        expect(
          expression.test(
            pattern.replace("??????????", input.apiId) + "/stages/prod"
          )
        ).toBe(false);
      }
    }
  });
  it("bootstrap can create only the named/tagged API, never integrations or other services", () => {
    const p = bootstrapPolicy(input);
    expect(
      allows(p).every((s) => JSON.stringify(s.Action).includes("apigateway:"))
    ).toBe(true);
    expect(p.Statement).toContainEqual({
      Effect: "Allow",
      Action: "apigateway:POST",
      Resource: "arn:aws:apigateway:us-east-1::/apis",
      Condition: {
        StringEquals: {
          "aws:RequestTag/preview-id": input.id,
          "apigateway:Request/ApiName": previewNames(input).stackName
        }
      }
    });
    expect(JSON.stringify(p)).not.toMatch(/integrations|routes|stages/);
    for (const s of allows(p).filter(
      (s) => s.Resource !== "arn:aws:apigateway:us-east-1::/apis"
    ))
      expect(s.Condition?.StringEquals["aws:ResourceTag/preview-id"]).toBe(
        input.id
      );
  });
  it.each([
    { apiId: "*" },
    { stackArn: input.stackArn.replace("synthetic-task", "production") },
    { tableArn: `${input.tableArn}/index/*` },
    { tableArn: input.tableArn.replace(input.account, "111111111111") },
    { assetKeys: { ...input.assetKeys, Backend: "*" } },
    { assetKmsKeyArn: "*" },
    { assetBucketKeyEnabled: undefined },
    { id: "../../prod" }
  ])("rejects unresolved/wildcard/cross-scope inventory %j", (overrides) => {
    expect(() =>
      deploymentPolicies({ ...input, ...overrides } as ResolvedDeployment)
    ).toThrow();
  });
});
const changeSet = (
  type = "AWS::ApiGatewayV2::Api",
  action = "Add",
  replacement?: string
) => ({
  StackId: input.stackArn,
  Status: "CREATE_COMPLETE",
  ExecutionStatus: "AVAILABLE",
  Changes: [
    {
      Type: "Resource",
      ResourceChange: {
        ResourceType: type,
        LogicalResourceId: "PreviewApiD1851C0B",
        Action: action,
        Replacement: replacement
      }
    }
  ]
});
const fullChangeSet = () => ({
  ...changeSet(),
  Changes: Object.entries(previewResourceTypes).map(
    ([LogicalResourceId, ResourceType]) => ({
      Type: "Resource",
      ResourceChange: {
        LogicalResourceId,
        ResourceType,
        Action: LogicalResourceId === "PreviewApiD1851C0B" ? "Modify" : "Add",
        Replacement: "False"
      }
    })
  )
});
describe("offline change-set review", () => {
  it("accepts an API-only bootstrap and a retained API", () => {
    expect(() =>
      assertSafeChangeSet(changeSet(), input.stackArn, "api-only")
    ).not.toThrow();
    expect(() =>
      assertSafeChangeSet(fullChangeSet(), input.stackArn, "full")
    ).not.toThrow();
  });
  it.each(["True", "Conditional"])("rejects %s replacement", (replacement) => {
    expect(() =>
      assertSafeChangeSet(
        changeSet(undefined, "Modify", replacement),
        input.stackArn,
        "full"
      )
    ).toThrow();
  });
  it("rejects removals, production resources, wrong stacks and a second API", () => {
    expect(() =>
      assertSafeChangeSet(
        changeSet(undefined, "Remove"),
        input.stackArn,
        "full"
      )
    ).toThrow();
    expect(() =>
      assertSafeChangeSet(
        changeSet("AWS::DynamoDB::Table"),
        input.stackArn,
        "full"
      )
    ).toThrow();
    expect(() =>
      assertSafeChangeSet(changeSet(), "other-stack", "api-only")
    ).toThrow();
    expect(() =>
      assertSafeChangeSet(changeSet(), input.stackArn, "full")
    ).toThrow();
    expect(() =>
      assertSafeChangeSet(
        changeSet("AWS::Lambda::Function"),
        input.stackArn,
        "api-only"
      )
    ).toThrow();
  });
});
