#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const expectedNode = readFileSync(join(repoRoot, ".nvmrc"), "utf8").trim();
const shouldPrint = process.argv.includes("--print");

function parseMajor(value) {
  const match = value.match(/v?(\d+)/);
  return match ? Number(match[1]) : undefined;
}

function parseUserAgentNodeVersion(userAgent) {
  const match = userAgent.match(/\bnode\/v?([0-9]+(?:\.[0-9]+){0,2})\b/);
  return match ? match[1] : undefined;
}

const expectedMajor = parseMajor(expectedNode);
const scriptNodeVersion = process.versions.node;
const scriptNodeMajor = parseMajor(scriptNodeVersion);
const pnpmNodeVersion = parseUserAgentNodeVersion(
  process.env.npm_config_user_agent ?? ""
);
const pnpmNodeMajor = pnpmNodeVersion ? parseMajor(pnpmNodeVersion) : undefined;

const failures = [];

if (scriptNodeMajor !== expectedMajor) {
  failures.push(
    `node on PATH is ${scriptNodeVersion} at ${process.execPath}; expected Node ${expectedNode}.`
  );
}

if (pnpmNodeMajor !== undefined && pnpmNodeMajor !== expectedMajor) {
  failures.push(
    `pnpm is running under Node ${pnpmNodeVersion}; expected Node ${expectedNode}.`
  );
}

if (failures.length > 0) {
  console.error(`This repo requires Node ${expectedNode} from .nvmrc.`);
  console.error("");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  console.error("");
  console.error("Switch to Node 24 before running repo commands:");
  console.error(
    "- macOS/Linux: run `nvm use`, `fnm use`, or your Node manager equivalent."
  );
  console.error(
    "- Windows: run `nvm use 24` or ensure Node 24 is first on PATH."
  );
  console.error(
    "- Codex cloud/local: select or install Node 24 in the active environment, then rerun the command."
  );
  process.exit(1);
}

if (shouldPrint) {
  const pnpmRuntime = pnpmNodeVersion
    ? `; pnpm runtime Node ${pnpmNodeVersion}`
    : "";
  console.log(
    `Node ${scriptNodeVersion} matches .nvmrc (${expectedNode})${pnpmRuntime}.`
  );
}
