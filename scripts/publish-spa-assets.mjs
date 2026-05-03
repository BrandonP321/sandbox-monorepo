#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));

const stackName = requireArg(args, "stack-name");
const webFilter = requireArg(args, "web-filter");
const distPath = requireArg(args, "dist-path");

const apiBaseUrl = readOutput("API_BASE_URL", "ApiBaseUrl");
const webBucketName = readOutput("WEB_BUCKET_NAME", "WebBucketName");
const webDistributionId = readOutput(
  "WEB_DISTRIBUTION_ID",
  "WebDistributionId"
);
const webUrl = readOutput("WEB_URL", "WebUrl");

run("pnpm", ["--filter", webFilter, "run", "build"], {
  ...process.env,
  VITE_API_BASE_URL: apiBaseUrl
});
run("aws", ["s3", "sync", distPath, `s3://${webBucketName}`, "--delete"]);
run("aws", [
  "cloudfront",
  "create-invalidation",
  "--distribution-id",
  webDistributionId,
  "--paths",
  "/*"
]);

console.log(`Published ${webFilter} to ${webUrl}`);
console.log(`API URL: ${apiBaseUrl}`);

function parseArgs(rawArgs) {
  const parsed = new Map();

  for (let index = 0; index < rawArgs.length; index += 2) {
    const key = rawArgs[index];
    const value = rawArgs[index + 1];

    if (!key?.startsWith("--") || !value) {
      throw new Error(`Invalid argument list: ${rawArgs.join(" ")}`);
    }

    parsed.set(key.slice(2), value);
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

function readOutput(envName, outputName) {
  const envValue = process.env[envName]?.trim();
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
