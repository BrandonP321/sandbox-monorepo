#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const [, , command, project] = process.argv;

if (!command || !project) {
  console.error(
    "Usage: node scripts/project-command.mjs <dev|build|deploy> <project>"
  );
  process.exit(1);
}

const filter =
  command === "deploy"
    ? `./apps/*/${project}/${project}-infra`
    : `./apps/*/${project}/${project}-*`;

const result = spawnSync("pnpm", ["-r", "--filter", filter, "run", command], {
  stdio: "inherit",
  shell: true
});

process.exit(result.status ?? 1);
