import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import { App } from "aws-cdk-lib";
import {
  WeddingPreviewStack,
  type WeddingPreviewConfig
} from "../lib/wedding-preview-stack.js";
import {
  bootstrapPolicy,
  deploymentPolicies,
  previewNames,
  previewResourceTypes,
  type ResolvedDeployment
} from "../lib/wedding-preview-deployment.js";

// Pure local synthesis. Never runs CDK deploy, assumes roles, or uploads assets.
const [configPath, artifactPath, outputPath, phase, resolvedPath] =
  process.argv.slice(2);
if (
  !configPath ||
  !artifactPath ||
  !outputPath ||
  !["api-only", "full"].includes(phase ?? "")
)
  throw new Error(
    "Usage: tsx bin/wedding-preview.ts CONFIG ARTIFACT_DIR NEW_OUTPUT_DIR api-only|full [RESOLVED_CONFIG]"
  );
const config = JSON.parse(
  readFileSync(configPath, "utf8")
) as WeddingPreviewConfig;
const names = previewNames(config);
const outdir = resolve(outputPath);
if (existsSync(outdir))
  throw new Error("Output directory must not already exist");
if (phase === "full" && !resolvedPath)
  throw new Error(
    "Full synthesis requires resolved bootstrap/API/artifact inputs"
  );
const resolved = resolvedPath
  ? (JSON.parse(readFileSync(resolvedPath, "utf8")) as ResolvedDeployment)
  : undefined;
const policies = resolved ? deploymentPolicies(resolved) : undefined;
if (
  resolved &&
  (resolved.id !== config.id ||
    resolved.account !== config.account ||
    resolved.region !== config.region ||
    resolved.tableArn !== config.tableArn)
)
  throw new Error("Resolved inventory does not match preview configuration");
const app = new App({
  outdir,
  context: { "aws:cdk:enable-path-metadata": false }
});
new WeddingPreviewStack(
  app,
  config,
  {
    frontend: resolve(artifactPath, "frontend"),
    backend: resolve(artifactPath, "backend")
  },
  {},
  phase as "api-only" | "full"
);
const assembly = app.synth();
const templatePath = join(outdir, `${names.stackName}.template.json`);
const template = JSON.parse(readFileSync(templatePath, "utf8")) as {
  Resources: Record<
    string,
    {
      Type: string;
      Properties: { FunctionName?: string; Code?: { S3Key?: string } };
    }
  >;
};
const expectedResources =
  phase === "api-only"
    ? { PreviewApiD1851C0B: "AWS::ApiGatewayV2::Api" }
    : previewResourceTypes;
if (
  Object.keys(template.Resources).length !==
    Object.keys(expectedResources).length ||
  Object.entries(template.Resources).some(
    ([id, r]) => expectedResources[id] !== r.Type
  )
)
  throw new Error("Unexpected resource inventory");
if (resolved) {
  for (const kind of ["Backend", "Frontend"] as const) {
    const resource = Object.values(template.Resources).find(
      (r) =>
        r.Type === "AWS::Lambda::Function" &&
        r.Properties.FunctionName === names.functionNames[kind]
    );
    if (resource?.Properties.Code?.S3Key !== resolved.assetKeys[kind])
      throw new Error(
        "Asset hash differs from approved exact-object policy; output is NOT ready"
      );
  }
}
const policyDir = join(outdir, "reviewed-policies");
mkdirSync(policyDir);
const save = (name: string, value: unknown) =>
  writeFileSync(
    join(policyDir, `${name}.json`),
    `${JSON.stringify(value, null, 2)}\n`
  );
save("bootstrap-execution", bootstrapPolicy(config));
save("execution-trust", {
  Version: "2012-10-17",
  Statement: [
    {
      Effect: "Allow",
      Principal: { Service: "cloudformation.amazonaws.com" },
      Action: "sts:AssumeRole"
    }
  ]
});
if (policies) {
  save("final-execution", policies.execution);
  save("publisher-operation-scope", policies.publisher);
  for (const kind of ["Backend", "Frontend", "Cleanup"] as const)
    save(`${kind}-boundary`, policies.boundaries[kind]);
}
// Review-only inventory. CLI deployment through standard CDK roles is deliberately excluded.
writeFileSync(
  join(outdir, "LOCAL-REVIEW.json"),
  JSON.stringify(
    {
      phase,
      stackName: names.stackName,
      resourceCount: Object.keys(template.Resources).length,
      templateSha256: createHash("sha256")
        .update(readFileSync(templatePath))
        .digest("hex"),
      executionRoleArn: names.executionRoleArn,
      boundaryArns: names.boundaryArns,
      expectedExistingApiId: resolved?.apiId,
      expectedStackArn: resolved?.stackArn,
      synthetic: config.account === "000000000000",
      deploymentMethod:
        "Reviewed direct CloudFormation change set; never default cdk deploy",
      localOnly: true,
      cloudVerified: false,
      assemblyDirectory: assembly.directory
    },
    null,
    2
  )
);

writeFileSync(
  join(outdir, "cloudformation-change-set-input.json"),
  JSON.stringify(
    {
      StackName: resolved?.stackArn ?? names.stackName,
      ChangeSetName: `${config.id}-${phase}-${Date.parse(config.createdAt)}`,
      ChangeSetType: phase === "api-only" ? "CREATE" : "UPDATE",
      RoleARN: names.executionRoleArn,
      Capabilities: ["CAPABILITY_NAMED_IAM"],
      TemplateBody: readFileSync(templatePath, "utf8")
    },
    null,
    2
  )
);
