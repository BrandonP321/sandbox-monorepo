import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { runProjectCommand } from "./project-command.mjs";

describe("runProjectCommand", () => {
  it("passes a multi-package project filter to pnpm without shell expansion", () => {
    const calls = [];

    const status = runProjectCommand(
      { command: "build", project: "wedding-website" },
      {
        runner: (command, args, options) => {
          calls.push({ args, command, options });
          return { status: 0 };
        }
      }
    );

    assert.equal(status, 0);
    assert.deepEqual(calls, [
      {
        command: "pnpm",
        args: [
          "-r",
          "--filter",
          "./apps/*/wedding-website/wedding-website-*",
          "run",
          "build"
        ],
        options: { stdio: "inherit" }
      }
    ]);
  });

  it("targets only the infra package for deploy commands", () => {
    const calls = [];

    runProjectCommand(
      { command: "deploy", project: "wedding-website" },
      {
        runner: (command, args, options) => {
          calls.push({ args, command, options });
          return { status: 0 };
        }
      }
    );

    assert.deepEqual(calls[0]?.args, [
      "-r",
      "--filter",
      "./apps/*/wedding-website/wedding-website-infra",
      "run",
      "deploy"
    ]);
  });
});
