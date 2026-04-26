import { spawnSync } from "node:child_process";
import { join } from "node:path";

import { getCollectionPath, getEnvironmentPath } from "./paths.js";
import type { LoadedPostmanProject } from "./types.js";

export function runProjectWithNewman(options: {
  environmentKey: string;
  project: LoadedPostmanProject;
  repoRoot: string;
}): void {
  const newmanScript = join(
    options.repoRoot,
    "packages",
    "postman-sync",
    "node_modules",
    "newman",
    "bin",
    "newman.js"
  );
  const result = spawnSync(
    process.execPath,
    [
      newmanScript,
      "run",
      getCollectionPath(options.project),
      "-e",
      getEnvironmentPath(options.project, options.environmentKey)
    ],
    {
      cwd: options.repoRoot,
      stdio: "inherit"
    }
  );

  if (result.status !== 0) {
    throw new Error(`Newman exited with status ${result.status ?? 1}.`);
  }
}
