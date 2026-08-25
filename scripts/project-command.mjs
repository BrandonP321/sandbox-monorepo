#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export function runProjectCommand(
  { command, project },
  { runner = spawnSync } = {}
) {
  if (!command || !project) {
    throw new Error(
      "Usage: node scripts/project-command.mjs <dev|build|deploy> <project>"
    );
  }

  const filter =
    command === "deploy"
      ? `./apps/*/${project}/${project}-infra`
      : `./apps/*/${project}/${project}-*`;

  const result = runner("pnpm", ["-r", "--filter", filter, "run", command], {
    stdio: "inherit"
  });

  return result.status ?? 1;
}

function main() {
  const [, , command, project] = process.argv;

  try {
    process.exitCode = runProjectCommand({ command, project });
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
