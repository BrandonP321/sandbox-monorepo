import { join } from "node:path";

import type { LoadedPostmanProject } from "./types.js";

export function getPostmanDirectory(project: LoadedPostmanProject): string {
  return join(project.projectRoot, ".postman");
}

export function getCollectionPath(project: LoadedPostmanProject): string {
  return join(getPostmanDirectory(project), "collection.generated.json");
}

export function getEnvironmentPath(
  project: LoadedPostmanProject,
  environmentKey: string
): string {
  return join(
    getPostmanDirectory(project),
    "environments",
    `${environmentKey}.generated.json`
  );
}

export function getStatePath(project: LoadedPostmanProject): string {
  return join(getPostmanDirectory(project), "postman-state.json");
}
