#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const sandboxProfile = "sandbox-admin";

export function hasSandboxLogin(
  runner = spawnSync,
  hasUsableSsoToken = hasUsableSandboxSsoToken
) {
  const result = runner(
    "aws",
    ["sts", "get-caller-identity", "--profile", sandboxProfile],
    { stdio: "pipe" }
  );

  return result.status === 0 && !result.error && hasUsableSsoToken();
}

export function ensureSandboxLogin(
  runner = spawnSync,
  log = console,
  hasUsableSsoToken = hasUsableSandboxSsoToken
) {
  if (hasSandboxLogin(runner, hasUsableSsoToken)) {
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

  if (!hasSandboxLogin(runner, hasUsableSsoToken)) {
    throw new Error(
      `AWS profile ${sandboxProfile} is still unavailable after login.`
    );
  }
}

export function hasUsableSandboxSsoToken(
  now = new Date(),
  awsDirectory = join(homedir(), ".aws")
) {
  const startUrl = getSandboxSsoStartUrl(awsDirectory);

  if (!startUrl) {
    return false;
  }

  const cacheDirectory = join(awsDirectory, "sso", "cache");

  if (!existsSync(cacheDirectory)) {
    return false;
  }

  return readdirSync(cacheDirectory).some((fileName) => {
    if (!fileName.endsWith(".json")) {
      return false;
    }

    return isUsableSandboxSsoToken(
      join(cacheDirectory, fileName),
      startUrl,
      now
    );
  });
}

function getSandboxSsoStartUrl(awsDirectory) {
  const configPath = join(awsDirectory, "config");

  if (!existsSync(configPath)) {
    return undefined;
  }

  const sections = parseAwsConfig(readFileSync(configPath, "utf8"));
  const profile = sections.get(`profile ${sandboxProfile}`);
  const sessionName = profile?.sso_session;

  if (sessionName) {
    return sections.get(`sso-session ${sessionName}`)?.sso_start_url;
  }

  return profile?.sso_start_url;
}

function parseAwsConfig(contents) {
  const sections = new Map();
  let currentSection;

  for (const line of contents.split(/\r?\n/u)) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const sectionMatch = /^\[(.+)\]$/u.exec(trimmedLine);

    if (sectionMatch) {
      currentSection = {};
      sections.set(sectionMatch[1], currentSection);
      continue;
    }

    if (!currentSection) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();

    currentSection[key] = value;
  }

  return sections;
}

function isUsableSandboxSsoToken(tokenPath, startUrl, now) {
  try {
    const token = JSON.parse(readFileSync(tokenPath, "utf8"));

    if (
      token.startUrl !== startUrl ||
      typeof token.accessToken !== "string" ||
      typeof token.expiresAt !== "string"
    ) {
      return false;
    }

    const expiresAt = new Date(token.expiresAt).getTime();
    const minimumUsableUntil = now.getTime() + 60_000;

    return Number.isFinite(expiresAt) && expiresAt > minimumUsableUntil;
  } catch {
    return false;
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
