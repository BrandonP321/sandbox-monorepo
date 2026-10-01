import {
  Duration,
  RemovalPolicy,
  Stack,
  CfnOutput,
  DefaultStackSynthesizer,
  Tags,
  type StackProps
} from "aws-cdk-lib";
import { HttpApi, HttpMethod, CfnStage } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import {
  Role,
  ServicePrincipal,
  PolicyStatement,
  Effect,
  ManagedPolicy
} from "aws-cdk-lib/aws-iam";
import { Function, Runtime, Code } from "aws-cdk-lib/aws-lambda";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { CfnSchedule } from "aws-cdk-lib/aws-scheduler";
import type { Construct } from "constructs";
import { previewNames } from "./wedding-preview-deployment.js";

export type WeddingPreviewConfig = {
  id: string;
  account: string;
  region: "us-east-1";
  tableArn: string;
  deploymentRoleArn: string;
  boundaryArns: { Backend: string; Frontend: string; Cleanup: string };
  adminAccessKeySha256: string | null;
  createdAt: string;
  expiresAt: string;
  sourceRevision: string;
};

export function validatePreviewConfig(
  config: WeddingPreviewConfig,
  now: number = Date.now()
) {
  if (
    !/^[a-z0-9][a-z0-9-]{2,30}$/.test(config.id) ||
    !/^\d{12}$/.test(config.account) ||
    config.region !== "us-east-1"
  )
    throw new Error("Invalid preview identity");
  const names = previewNames(config);
  if (config.deploymentRoleArn !== names.executionRoleArn)
    throw new Error("Execution role must match this exact preview");
  for (const kind of ["Backend", "Frontend", "Cleanup"] as const)
    if (config.boundaryArns?.[kind] !== names.boundaryArns[kind])
      throw new Error("Exact externally managed preview boundaries required");
  const prefix = `arn:aws:dynamodb:${config.region}:${config.account}:table/`;
  if (
    !new RegExp(
      `^arn:aws:iam::${config.account}:role/WeddingPreviewExecution-[A-Za-z0-9-]+$`
    ).test(config.deploymentRoleArn)
  )
    throw new Error(
      "An explicitly reviewed preview CloudFormation execution role is required"
    );
  if (
    !config.tableArn.startsWith(prefix) ||
    !/^[A-Za-z0-9_.-]{3,255}$/.test(config.tableArn.slice(prefix.length))
  )
    throw new Error("Explicit same-account table ARN required");
  if (
    config.adminAccessKeySha256 !== null &&
    (!/^[a-f0-9]{64}$/.test(config.adminAccessKeySha256) ||
      config.adminAccessKeySha256 === "0".repeat(64))
  )
    throw new Error("Separate preview admin key hash required");
  const duration = Date.parse(config.expiresAt) - Date.parse(config.createdAt);
  if (
    !Number.isFinite(duration) ||
    duration <= 0 ||
    duration > 86_400_000 ||
    Date.parse(config.createdAt) > now ||
    Date.parse(config.expiresAt) <= now ||
    !config.expiresAt.endsWith("Z") ||
    !config.createdAt.endsWith("Z")
  )
    throw new Error(
      "Preview must be active now with a lifetime of at most 24 hours in UTC"
    );
  if (!/^[a-f0-9]{40}$/.test(config.sourceRevision))
    throw new Error("Source revision required");
}

// Deliberately separate from WeddingWebsiteStack and its production bin/pipeline.
// Existing data store is ONLY an ARN string in IAM and a name in Lambda env.
export class WeddingPreviewStack extends Stack {
  constructor(
    scope: Construct,
    config: WeddingPreviewConfig,
    assets: { frontend: string; backend: string },
    props: StackProps = {},
    phase: "api-only" | "full" = "full"
  ) {
    validatePreviewConfig(config);
    super(scope, `WeddingPreview-${config.id}`, {
      ...props,
      stackName: `WeddingPreview-${config.id}`,
      synthesizer: new DefaultStackSynthesizer({
        cloudFormationExecutionRole: config.deploymentRoleArn,
        deployRoleArn: "",
        fileAssetPublishingRoleArn: "",
        imageAssetPublishingRoleArn: "",
        lookupRoleArn: "",
        useLookupRoleForStackOperations: false,
        generateBootstrapVersionRule: false
      }),
      env: { account: config.account, region: config.region }
    });
    Tags.of(this).add("preview-id", config.id);
    Tags.of(this).add("expires-at", config.expiresAt);
    Tags.of(this).add("source-revision", config.sourceRevision);
    const names = previewNames(config);
    // Identical logical ID and properties in both phases. No serving stage in bootstrap.
    if (phase === "api-only") {
      const api = new HttpApi(this, "PreviewApi", {
        apiName: names.stackName,
        createDefaultStage: false
      });
      new CfnOutput(this, "PreviewUrl", { value: api.apiEndpoint });
      new CfnOutput(this, "ApiId", { value: api.apiId });
      return;
    }
    const environment = {
      PREVIEW_CREATED_AT: config.createdAt,
      PREVIEW_EXPIRES_AT: config.expiresAt
    };
    const backend = this.function(
      "Backend",
      assets.backend,
      {
        ...environment,
        RSVP_TABLE_NAME: config.tableArn.split("/")[1],
        ADMIN_ACCESS_KEY_SHA256: config.adminAccessKeySha256 ?? "0".repeat(64)
      },
      10,
      config
    );
    backend.addToRolePolicy(
      new PolicyStatement({
        actions: ["dynamodb:Scan"],
        resources: [config.tableArn]
      })
    );
    // Even an accidental future Allow cannot make the runtime write to any table.
    backend.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.DENY,
        notActions: ["dynamodb:Scan"],
        resources: ["arn:aws:dynamodb:*:*:table/*"]
      })
    );
    const frontend = this.function(
      "Frontend",
      assets.frontend,
      {
        ...environment
      },
      15,
      config
    );
    frontend.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.DENY,
        actions: ["dynamodb:*"],
        resources: ["*"]
      })
    );
    const api = new HttpApi(this, "PreviewApi", {
      apiName: names.stackName,
      defaultIntegration: new HttpLambdaIntegration(
        "FrontendIntegration",
        frontend
      )
    });
    api.addRoutes({
      path: "/api/admin/rsvps",
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration("BackendIntegration", backend)
    });
    const stage = api.defaultStage?.node.defaultChild as CfnStage;
    stage.defaultRouteSettings = {
      throttlingBurstLimit: 10,
      throttlingRateLimit: 2
    };

    const cleanupRole = new Role(this, "CleanupRole", {
      roleName: names.roleNames.Cleanup,
      permissionsBoundary: ManagedPolicy.fromManagedPolicyArn(
        this,
        "CleanupBoundary",
        config.boundaryArns.Cleanup
      ),
      assumedBy: new ServicePrincipal("scheduler.amazonaws.com", {
        conditions: {
          StringEquals: { "aws:SourceAccount": config.account },
          ArnEquals: {
            "aws:SourceArn": this.formatArn({
              service: "scheduler",
              resource: "schedule-group",
              resourceName: "default"
            })
          }
        }
      })
    });
    cleanupRole.addToPolicy(
      new PolicyStatement({
        actions: ["cloudformation:DeleteStack"],
        resources: [this.stackId]
      })
    );
    cleanupRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.DENY,
        actions: ["dynamodb:*"],
        resources: ["*"]
      })
    );
    const cleanupSchedule = new CfnSchedule(this, "ExpiryCleanup", {
      name: names.scheduleName,
      groupName: "default",
      scheduleExpression: `at(${new Date(config.expiresAt).toISOString().slice(0, 19)})`,
      scheduleExpressionTimezone: "UTC",
      flexibleTimeWindow: { mode: "OFF" },
      target: {
        arn: "arn:aws:scheduler:::aws-sdk:cloudformation:deleteStack",
        roleArn: cleanupRole.roleArn,
        input: this.toJsonString({ StackName: this.stackId }),
        retryPolicy: { maximumEventAgeInSeconds: 3600, maximumRetryAttempts: 3 }
      }
    });
    // Keep the target authorization until the schedule has been removed.
    cleanupSchedule.node.addDependency(cleanupRole);
    if (cleanupRole.node.tryFindChild("DefaultPolicy"))
      cleanupSchedule.node.addDependency(
        cleanupRole.node.findChild("DefaultPolicy")
      );
    new CfnOutput(this, "ApiId", { value: api.apiId });
    new CfnOutput(this, "PreviewUrl", { value: api.apiEndpoint });
    new CfnOutput(this, "AdminApiUrl", {
      value: `${api.apiEndpoint}/api/admin/rsvps`
    });
  }

  private function(
    id: "Backend" | "Frontend",
    asset: string,
    environment: Record<string, string>,
    seconds: number,
    config: WeddingPreviewConfig
  ) {
    const names = previewNames(config);
    const logGroup = new LogGroup(this, `${id}Logs`, {
      logGroupName: names.logNames[id],
      retention: RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY
    });
    const role = new Role(this, `${id}Role`, {
      roleName: names.roleNames[id],
      permissionsBoundary: ManagedPolicy.fromManagedPolicyArn(
        this,
        `${id}Boundary`,
        config.boundaryArns[id]
      ),
      assumedBy: new ServicePrincipal("lambda.amazonaws.com")
    });
    logGroup.grantWrite(role);
    return new Function(this, id, {
      functionName: names.functionNames[id],
      runtime: Runtime.NODEJS_24_X,
      handler: "index.handler",
      code: Code.fromAsset(asset),
      role,
      logGroup,
      environment,
      memorySize: 256,
      timeout: Duration.seconds(seconds)
    });
  }
}
