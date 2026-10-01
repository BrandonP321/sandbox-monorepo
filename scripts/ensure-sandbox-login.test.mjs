import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  ensureSandboxLogin,
  hasSandboxLogin,
  hasUsableSandboxSsoToken,
  sandboxProfile
} from "./ensure-sandbox-login.mjs";

function result(status) {
  return {
    error: undefined,
    status
  };
}

function createSsoFixture(t) {
  const directory = mkdtempSync(join(tmpdir(), "sandbox-sso-test-"));
  const awsDirectory = join(directory, ".aws");
  const cacheDirectory = join(awsDirectory, "sso", "cache");
  const previousConfigFile = process.env.AWS_CONFIG_FILE;
  t.after(() => {
    if (previousConfigFile === undefined) {
      delete process.env.AWS_CONFIG_FILE;
    } else {
      process.env.AWS_CONFIG_FILE = previousConfigFile;
    }
    rmSync(directory, { recursive: true, force: true });
  });
  delete process.env.AWS_CONFIG_FILE;
  mkdirSync(cacheDirectory, { recursive: true });
  writeFileSync(
    join(cacheDirectory, "fake-token.json"),
    JSON.stringify({
      startUrl: "https://example.invalid/start",
      accessToken: "FAKE_TEST_TOKEN_NOT_A_CREDENTIAL",
      expiresAt: "2030-01-01T01:00:00Z"
    })
  );
  const config = `[profile sandbox-admin]
sso_session = sandbox-test
[sso-session sandbox-test]
sso_start_url = https://example.invalid/start
`;
  return { directory, awsDirectory, config };
}

test("SSO token check honors AWS_CONFIG_FILE without moving its cache", (t) => {
  const { directory, awsDirectory, config } = createSsoFixture(t);
  writeFileSync(
    join(awsDirectory, "config"),
    config.replace("example.invalid", "different.invalid")
  );
  const alternateConfig = join(directory, "alternate-config");
  writeFileSync(alternateConfig, config);
  process.env.AWS_CONFIG_FILE = alternateConfig;

  assert.equal(
    hasUsableSandboxSsoToken(new Date("2030-01-01T00:00:00Z"), awsDirectory),
    true
  );
});

test("SSO token check uses the default config when AWS_CONFIG_FILE is unset", (t) => {
  const { awsDirectory, config } = createSsoFixture(t);
  writeFileSync(join(awsDirectory, "config"), config);

  assert.equal(
    hasUsableSandboxSsoToken(new Date("2030-01-01T00:00:00Z"), awsDirectory),
    true
  );
});

test("hasSandboxLogin checks the sandbox-admin caller identity", () => {
  const calls = [];
  const runner = (command, args, options) => {
    calls.push({ command, args, options });
    return result(0);
  };

  assert.equal(
    hasSandboxLogin(runner, () => true),
    true
  );
  assert.deepEqual(calls, [
    {
      command: "aws",
      args: ["sts", "get-caller-identity", "--profile", sandboxProfile],
      options: { stdio: "pipe" }
    }
  ]);
});

test("hasSandboxLogin fails when the SDK SSO token is expired", () => {
  const runner = () => result(0);

  assert.equal(
    hasSandboxLogin(runner, () => false),
    false
  );
});

test("ensureSandboxLogin runs the repo login script when the profile is missing", () => {
  const calls = [];
  const runner = (command, args, options) => {
    calls.push({ command, args, options });
    return result(calls.length === 1 ? 1 : 0);
  };

  ensureSandboxLogin(runner, { log: () => undefined }, () => true);

  assert.deepEqual(calls, [
    {
      command: "aws",
      args: ["sts", "get-caller-identity", "--profile", sandboxProfile],
      options: { stdio: "pipe" }
    },
    {
      command: "pnpm",
      args: ["aws:login:sandbox"],
      options: { stdio: "inherit" }
    },
    {
      command: "aws",
      args: ["sts", "get-caller-identity", "--profile", sandboxProfile],
      options: { stdio: "pipe" }
    }
  ]);
});

test("ensureSandboxLogin runs the repo login script when the SDK SSO token is expired", () => {
  const calls = [];
  const runner = (command, args, options) => {
    calls.push({ command, args, options });
    return result(0);
  };
  let tokenCheckCount = 0;

  ensureSandboxLogin(runner, { log: () => undefined }, () => {
    tokenCheckCount += 1;

    return tokenCheckCount > 1;
  });

  assert.deepEqual(calls, [
    {
      command: "aws",
      args: ["sts", "get-caller-identity", "--profile", sandboxProfile],
      options: { stdio: "pipe" }
    },
    {
      command: "pnpm",
      args: ["aws:login:sandbox"],
      options: { stdio: "inherit" }
    },
    {
      command: "aws",
      args: ["sts", "get-caller-identity", "--profile", sandboxProfile],
      options: { stdio: "pipe" }
    }
  ]);
});

test("ensureSandboxLogin fails when login does not restore the profile", () => {
  assert.throws(
    () =>
      ensureSandboxLogin(
        () => result(1),
        { log: () => undefined },
        () => true
      ),
    /Unable to complete AWS login/
  );
});
