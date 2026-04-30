#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const sandboxProfile = "sandbox-admin";

export function hasSandboxLogin(runner = spawnSync) {
  const result = runner(
    "aws",
    ["sts", "get-caller-identity", "--profile", sandboxProfile],
    { stdio: "pipe" }
  );

  return result.status === 0 && !result.error;
}

export function ensureSandboxLogin(runner = spawnSync, log = console) {
  if (hasSandboxLogin(runner)) {
    return;
  }

  log.log(
    `AWS profile ${sandboxProfile} is not logged in. Running pnpm aws:login:sandbox before starting the API.`
  );

  const loginResult = runner("pnpm", ["aws:login:sandbox"], {
    stdio: "inherit"
  });

  if (loginResult.status !== 0 || loginResult.error) {
    throw new Error(
      `Unable to complete AWS login for profile ${sandboxProfile}.`
    );
  }

  if (!hasSandboxLogin(runner)) {
    throw new Error(
      `AWS profile ${sandboxProfile} is still unavailable after login.`
    );
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    ensureSandboxLogin();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
