#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export function publishSpaAssets(rawArgs, options = {}) {
  const args = parseArgs(rawArgs);
  const env = options.env ?? process.env;
  const logger = options.logger ?? console;

  const stackName = requireArg(args, "stack-name");
  const webFilter = requireArg(args, "web-filter");
  const distPath = requireArg(args, "dist-path");
  const buildScript = args.get("build-script")?.trim() || "build";
  const shouldReadApiBaseUrl = !args.has("skip-api-base-url");
  const readStackOutput =
    options.readStackOutput ??
    ((outputName) => readOutput({ env, outputName, stackName }));

  const apiBaseUrl = shouldReadApiBaseUrl
    ? readStackOutput("ApiBaseUrl")
    : undefined;
  const webBucketName = readStackOutput("WebBucketName");
  const webDistributionId = readStackOutput("WebDistributionId");
  const webUrl = readStackOutput("WebUrl");
  const buildEnv = apiBaseUrl ? { ...env, VITE_API_BASE_URL: apiBaseUrl } : env;
  const runner = options.runner ?? run;

  runner("pnpm", ["--filter", webFilter, "run", buildScript], buildEnv);
  runner("aws", ["s3", "sync", distPath, `s3://${webBucketName}`, "--delete"]);
  runner("aws", [
    "cloudfront",
    "create-invalidation",
    "--distribution-id",
    webDistributionId,
    "--paths",
    "/*"
  ]);

  logger.log(`Published ${webFilter} to ${webUrl}`);
  if (apiBaseUrl) {
    logger.log(`API URL: ${apiBaseUrl}`);
  }
}

function parseArgs(rawArgs) {
  const parsed = new Map();

  for (let index = 0; index < rawArgs.length; ) {
    const key = rawArgs[index];

    if (!key?.startsWith("--")) {
      throw new Error(`Invalid argument list: ${rawArgs.join(" ")}`);
    }

    const name = key.slice(2);

    if (name === "skip-api-base-url") {
      parsed.set(name, true);
      index += 1;
      continue;
    }

    const value = rawArgs[index + 1];

    if (!value || value.startsWith("--")) {
      throw new Error(`Invalid argument list: ${rawArgs.join(" ")}`);
    }

    parsed.set(name, value);
    index += 2;
  }

  return parsed;
}

function requireArg(argsByName, name) {
  const value = argsByName.get(name)?.trim();

  if (!value) {
    throw new Error(`Missing required argument: --${name}`);
  }

  return value;
}

function readOutput({ env, outputName, stackName }) {
  const envNameByOutputName = {
    ApiBaseUrl: "API_BASE_URL",
    WebBucketName: "WEB_BUCKET_NAME",
    WebDistributionId: "WEB_DISTRIBUTION_ID",
    WebUrl: "WEB_URL"
  };
  const envName = envNameByOutputName[outputName];
  const envValue = envName ? env[envName]?.trim() : undefined;

  if (envValue && envValue !== "None") {
    return envValue;
  }

  const outputValue = execFileSync(
    "aws",
    [
      "cloudformation",
      "describe-stacks",
      "--stack-name",
      stackName,
      "--query",
      `Stacks[0].Outputs[?OutputKey=='${outputName}'].OutputValue | [0]`,
      "--output",
      "text"
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }
  ).trim();

  if (!outputValue || outputValue === "None") {
    throw new Error(`Missing CloudFormation output ${outputName}`);
  }

  return outputValue;
}

function run(command, commandArgs, env = process.env) {
  const result = spawnSync(command, commandArgs, {
    env,
    stdio: "inherit"
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${command} ${commandArgs.join(" ")} failed`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  publishSpaAssets(process.argv.slice(2));
}
