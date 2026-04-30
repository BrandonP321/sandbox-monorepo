import assert from "node:assert/strict";
import test from "node:test";

import {
  ensureSandboxLogin,
  hasSandboxLogin,
  sandboxProfile
} from "./ensure-sandbox-login.mjs";

function result(status) {
  return {
    error: undefined,
    status
  };
}

test("hasSandboxLogin checks the sandbox-admin caller identity", () => {
  const calls = [];
  const runner = (command, args, options) => {
    calls.push({ command, args, options });
    return result(0);
  };

  assert.equal(hasSandboxLogin(runner), true);
  assert.deepEqual(calls, [
    {
      command: "aws",
      args: ["sts", "get-caller-identity", "--profile", sandboxProfile],
      options: { stdio: "pipe" }
    }
  ]);
});

test("ensureSandboxLogin runs the repo login script when the profile is missing", () => {
  const calls = [];
  const runner = (command, args, options) => {
    calls.push({ command, args, options });
    return result(calls.length === 1 ? 1 : 0);
  };

  ensureSandboxLogin(runner, { log: () => undefined });

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
    () => ensureSandboxLogin(() => result(1), { log: () => undefined }),
    /Unable to complete AWS login/
  );
});
