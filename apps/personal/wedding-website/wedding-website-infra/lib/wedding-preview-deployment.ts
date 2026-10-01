// Pure local policy rendering. No SDK clients, credentials or network operations.
export type PreviewIdentity = {
  id: string;
  account: string;
  region: "us-east-1";
};
type Kind = "Backend" | "Frontend" | "Cleanup";
type Statement = {
  Effect: "Allow" | "Deny";
  Action?: string | string[];
  NotAction?: string | string[];
  Resource: string | string[];
  Condition?: Record<string, Record<string, string | string[]>>;
};
export type Policy = { Version: "2012-10-17"; Statement: Statement[] };
const policy = (...Statement: Statement[]): Policy => ({
  Version: "2012-10-17",
  Statement
});
const allow = (
  Action: string | string[],
  Resource: string | string[],
  Condition?: Statement["Condition"]
): Statement => ({
  Effect: "Allow",
  Action,
  Resource,
  ...(Condition ? { Condition } : {})
});
const denyData: Statement = {
  Effect: "Deny",
  Action: "dynamodb:*",
  Resource: "*"
};
export const kinds: Kind[] = ["Backend", "Frontend", "Cleanup"];

export function previewNames(input: PreviewIdentity) {
  if (
    !/^[a-z0-9][a-z0-9-]{2,30}$/.test(input.id) ||
    !/^\d{12}$/.test(input.account) ||
    input.region !== "us-east-1"
  )
    throw new Error("Invalid preview identity");
  const stackName = `WeddingPreview-${input.id}`;
  const iam = `arn:aws:iam::${input.account}`;
  const roleNames = {
    Backend: `${stackName}-Backend`,
    Frontend: `${stackName}-Frontend`,
    Cleanup: `${stackName}-Cleanup`
  };
  const boundaryArns = Object.fromEntries(
    kinds.map((kind) => [kind, `${iam}:policy/${stackName}-${kind}Boundary`])
  ) as Record<Kind, string>;
  return {
    stackName,
    roleNames,
    boundaryArns,
    roleArns: Object.fromEntries(
      kinds.map((kind) => [kind, `${iam}:role/${roleNames[kind]}`])
    ) as Record<Kind, string>,
    functionNames: { Backend: roleNames.Backend, Frontend: roleNames.Frontend },
    logNames: {
      Backend: `/aws/lambda/${roleNames.Backend}`,
      Frontend: `/aws/lambda/${roleNames.Frontend}`
    },
    executionRoleArn: `${iam}:role/WeddingPreviewExecution-${input.id}`,
    scheduleName: `${stackName}-Expiry`,
    bucket: `cdk-hnb659fds-assets-${input.account}-${input.region}`
  };
}

export function bootstrapPolicy(input: PreviewIdentity) {
  const names = previewNames(input);
  const base = `arn:aws:apigateway:${input.region}::`;
  const tagged = { StringEquals: { "aws:ResourceTag/preview-id": input.id } };
  // No child-resource permissions. Only the approved tagged API can stabilize/rollback.
  return policy(
    denyData,
    allow("apigateway:POST", `${base}/apis`, {
      StringEquals: {
        "aws:RequestTag/preview-id": input.id,
        "apigateway:Request/ApiName": names.stackName
      }
    }),
    allow(
      ["apigateway:GET", "apigateway:DELETE"],
      `${base}/apis/??????????`,
      tagged
    ),
    allow(
      [
        "apigateway:GET",
        "apigateway:PUT",
        "apigateway:POST",
        "apigateway:PATCH",
        "apigateway:DELETE"
      ],
      `${base}/tags/${base}/apis/??????????`,
      tagged
    )
  );
}

export type ResolvedDeployment = PreviewIdentity & {
  apiId: string;
  stackArn: string;
  tableArn: string;
  assetKeys: { Backend: string; Frontend: string };
  assetKmsKeyArn: string;
  assetBucketKeyEnabled: boolean;
};
export function validateResolved(input: ResolvedDeployment) {
  const names = previewNames(input);
  const prefix = `arn:aws:dynamodb:${input.region}:${input.account}:table/`;
  if (!/^[a-z0-9]{10}$/.test(input.apiId))
    throw new Error("Resolved API ID required");
  const stackPrefix = `arn:aws:cloudformation:${input.region}:${input.account}:stack/${names.stackName}/`;
  if (
    !input.stackArn.startsWith(stackPrefix) ||
    !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(
      input.stackArn.slice(stackPrefix.length)
    )
  )
    throw new Error("Exact bootstrap stack ARN required");
  if (
    !input.tableArn.startsWith(prefix) ||
    !/^[A-Za-z0-9_.-]{3,255}$/.test(input.tableArn.slice(prefix.length))
  )
    throw new Error("Exact same-account table required");
  const keyPrefix = `arn:aws:kms:${input.region}:${input.account}:key/`;
  if (
    !input.assetKmsKeyArn.startsWith(keyPrefix) ||
    !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(
      input.assetKmsKeyArn.slice(keyPrefix.length)
    )
  )
    throw new Error("Resolved artifact KMS key ARN required");
  if (typeof input.assetBucketKeyEnabled !== "boolean")
    throw new Error("Explicit artifact bucket-key setting required");
  for (const kind of ["Backend", "Frontend"] as const)
    if (!/^[a-f0-9]{64}\.zip$/.test(input.assetKeys?.[kind]))
      throw new Error("Exact CDK zip asset keys required");
  return names;
}

export function deploymentPolicies(input: ResolvedDeployment) {
  const names = validateResolved(input);
  const regionAccount = `${input.region}:${input.account}`;
  const apiBase = `arn:aws:apigateway:${input.region}::`;
  const api = `${apiBase}/apis/${input.apiId}`;
  const logs = (kind: "Backend" | "Frontend") =>
    `arn:aws:logs:${regionAccount}:log-group:${names.logNames[kind]}`;
  const logWrite = (kind: "Backend" | "Frontend") =>
    allow(["logs:CreateLogStream", "logs:PutLogEvents"], `${logs(kind)}:*`);
  const boundaries = {
    Backend: policy(
      logWrite("Backend"),
      allow("dynamodb:Scan", input.tableArn),
      {
        Effect: "Deny",
        NotAction: "dynamodb:Scan",
        Resource: "arn:aws:dynamodb:*:*:table/*"
      }
    ),
    Frontend: policy(logWrite("Frontend"), denyData),
    Cleanup: policy(
      allow("cloudformation:DeleteStack", input.stackArn),
      denyData
    )
  };
  const functions = ["Backend", "Frontend"].map(
    (kind) =>
      `arn:aws:lambda:${regionAccount}:function:${names.stackName}-${kind}`
  );
  const objects = Object.values(input.assetKeys).map(
    (key) => `arn:aws:s3:::${names.bucket}/${key}`
  );
  const kmsCondition = {
    StringEquals: {
      "kms:ViaService": `s3.${input.region}.amazonaws.com`,
      "kms:CallerAccount": input.account,
      "kms:EncryptionContext:aws:s3:arn": input.assetBucketKeyEnabled
        ? `arn:aws:s3:::${names.bucket}`
        : objects
    }
  };
  const execution = policy(
    denyData,
    allow(["apigateway:GET", "apigateway:PATCH", "apigateway:DELETE"], api),
    allow(
      ["apigateway:GET", "apigateway:POST"],
      ["integrations", "routes", "stages"].map((path) => `${api}/${path}`)
    ),
    allow(
      ["apigateway:GET", "apigateway:PATCH", "apigateway:DELETE"],
      [`${api}/integrations/*`, `${api}/routes/*`, `${api}/stages/$default`]
    ),
    allow(
      [
        "apigateway:GET",
        "apigateway:PUT",
        "apigateway:POST",
        "apigateway:PATCH",
        "apigateway:DELETE"
      ],
      [`${apiBase}/tags/${api}`, `${apiBase}/tags/${api}/stages/$default`]
    ),
    allow(
      [
        "lambda:CreateFunction",
        "lambda:GetFunction",
        "lambda:GetFunctionConfiguration",
        "lambda:UpdateFunctionCode",
        "lambda:UpdateFunctionConfiguration",
        "lambda:DeleteFunction",
        "lambda:AddPermission",
        "lambda:RemovePermission",
        "lambda:GetPolicy",
        "lambda:ListTags",
        "lambda:TagResource",
        "lambda:UntagResource"
      ],
      functions
    ),
    allow(
      [
        "logs:CreateLogGroup",
        "logs:DeleteLogGroup",
        "logs:PutRetentionPolicy",
        "logs:DeleteRetentionPolicy"
      ],
      [logs("Backend"), logs("Frontend")].map((arn) => `${arn}:*`)
    ),
    allow(
      ["logs:TagResource", "logs:UntagResource", "logs:ListTagsForResource"],
      [logs("Backend"), logs("Frontend")]
    ),
    allow("logs:DescribeLogGroups", "*"),
    ...kinds.map((kind) =>
      allow("iam:CreateRole", names.roleArns[kind], {
        StringEquals: { "iam:PermissionsBoundary": names.boundaryArns[kind] }
      })
    ),
    allow(
      [
        "iam:GetRole",
        "iam:DeleteRole",
        "iam:GetRolePolicy",
        "iam:PutRolePolicy",
        "iam:DeleteRolePolicy",
        "iam:ListRolePolicies",
        "iam:ListAttachedRolePolicies",
        "iam:TagRole",
        "iam:UntagRole"
      ],
      Object.values(names.roleArns)
    ),
    allow("iam:PassRole", [names.roleArns.Backend, names.roleArns.Frontend], {
      StringEquals: { "iam:PassedToService": "lambda.amazonaws.com" }
    }),
    allow("iam:PassRole", names.roleArns.Cleanup, {
      StringEquals: { "iam:PassedToService": "scheduler.amazonaws.com" }
    }),
    allow(
      [
        "scheduler:CreateSchedule",
        "scheduler:GetSchedule",
        "scheduler:UpdateSchedule",
        "scheduler:DeleteSchedule"
      ],
      `arn:aws:scheduler:${regionAccount}:schedule/default/${names.scheduleName}`
    ),
    allow(["s3:GetObject", "s3:GetObjectVersion"], objects),
    allow("s3:GetBucketLocation", `arn:aws:s3:::${names.bucket}`),
    allow("kms:Decrypt", input.assetKmsKeyArn, kmsCondition)
  );
  // Operation-scoped proposal for an existing SSO operator, NOT a sandbox/permission set.
  const publisher = policy(
    denyData,
    allow(["s3:PutObject", "s3:GetObject"], objects),
    allow("s3:GetBucketLocation", `arn:aws:s3:::${names.bucket}`),
    allow(
      ["kms:GenerateDataKey", "kms:Decrypt"],
      input.assetKmsKeyArn,
      kmsCondition
    ),
    allow(
      "ssm:GetParameter",
      `arn:aws:ssm:${regionAccount}:parameter/cdk-bootstrap/hnb659fds/version`
    )
  );
  return {
    names,
    boundaries,
    execution,
    publisher,
    executionTrust: {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { Service: "cloudformation.amazonaws.com" },
          Action: "sts:AssumeRole"
        }
      ]
    }
  };
}

export const previewResourceTypes: Record<string, string> = {
  BackendLogs21FC23BC: "AWS::Logs::LogGroup",
  BackendRole78202DE5: "AWS::IAM::Role",
  BackendRoleDefaultPolicy96F27249: "AWS::IAM::Policy",
  BackendEC8447F5: "AWS::Lambda::Function",
  FrontendLogs9AD73413: "AWS::Logs::LogGroup",
  FrontendRole815EA6D6: "AWS::IAM::Role",
  FrontendRoleDefaultPolicy5243A5FE: "AWS::IAM::Policy",
  Frontend23D93C55: "AWS::Lambda::Function",
  PreviewApiD1851C0B: "AWS::ApiGatewayV2::Api",
  PreviewApiDefaultRouteFrontendIntegrationCE8C2B51:
    "AWS::ApiGatewayV2::Integration",
  PreviewApiDefaultRouteFrontendIntegrationPermission308404DF:
    "AWS::Lambda::Permission",
  PreviewApiDefaultRoute610E9C79: "AWS::ApiGatewayV2::Route",
  PreviewApiDefaultStage0A3C0EB6: "AWS::ApiGatewayV2::Stage",
  PreviewApiGETapiadminrsvpsBackendIntegrationCC4313F3:
    "AWS::ApiGatewayV2::Integration",
  PreviewApiGETapiadminrsvpsBackendIntegrationPermissionC55D0496:
    "AWS::Lambda::Permission",
  PreviewApiGETapiadminrsvps4C261470: "AWS::ApiGatewayV2::Route",
  CleanupRole9B76E1E6: "AWS::IAM::Role",
  CleanupRoleDefaultPolicyF2E6A473: "AWS::IAM::Policy",
  ExpiryCleanup: "AWS::Scheduler::Schedule"
};

// Reject dangerous UPDATE change sets before an operator can execute them.
// A fresh bootstrap may only contain one API; a full stack cannot replace it.
export function assertSafeChangeSet(
  changeSet: {
    StackId?: string;
    Status?: string;
    ExecutionStatus?: string;
    Changes?: {
      Type?: string;
      ResourceChange?: {
        Action?: string;
        LogicalResourceId?: string;
        ResourceType?: string;
        Replacement?: string;
      };
    }[];
  },
  expectedStackArn: string,
  phase: "api-only" | "full"
) {
  if (
    changeSet.StackId !== expectedStackArn ||
    changeSet.Status !== "CREATE_COMPLETE" ||
    changeSet.ExecutionStatus !== "AVAILABLE"
  )
    throw new Error("Change set is not ready for the exact approved stack");
  if (!changeSet.Changes?.length) throw new Error("Empty change set");
  if (phase === "api-only" && changeSet.Changes.length !== 1)
    throw new Error("Bootstrap must create only the API");
  const seen = new Set<string>();
  for (const change of changeSet.Changes) {
    const resource = change.ResourceChange;
    if (
      change.Type !== "Resource" ||
      !resource ||
      !resource.ResourceType ||
      previewResourceTypes[resource.LogicalResourceId ?? ""] !==
        resource.ResourceType
    )
      throw new Error("Unapproved resource type");
    if (seen.has(resource.LogicalResourceId!))
      throw new Error("Duplicate resource change");
    seen.add(resource.LogicalResourceId!);
    if (
      !["Add", "Modify"].includes(resource.Action ?? "") ||
      (resource.Replacement && resource.Replacement !== "False")
    )
      throw new Error("Deletion or replacement forbidden");
    if (resource.ResourceType === "AWS::ApiGatewayV2::Api") {
      if (
        resource.LogicalResourceId !== "PreviewApiD1851C0B" ||
        resource.Action !== (phase === "api-only" ? "Add" : "Modify")
      )
        throw new Error("API identity must be retained");
    } else if (phase === "api-only" || resource.Action !== "Add")
      throw new Error("Only initial preview resource additions allowed");
  }
  if (phase === "full") {
    for (const id of Object.keys(previewResourceTypes))
      if (id !== "PreviewApiD1851C0B" && !seen.has(id))
        throw new Error("Incomplete first-pilot change set");
  }
}
