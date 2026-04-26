import { dirname, join } from "node:path";

import { importDefault, listFilesRecursive } from "./fs-utils.js";
import type { LoadedPostmanProject, PostmanProjectConfig } from "./types.js";

export async function discoverProjects(
  repoRoot: string
): Promise<LoadedPostmanProject[]> {
  const appRoot = join(repoRoot, "apps");
  const configPaths = listFilesRecursive(appRoot).filter((filePath) =>
    filePath.endsWith("postman.config.ts")
  );

  const projects = await Promise.all(
    configPaths.map(async (configPath) => ({
      config: await importDefault<PostmanProjectConfig>(configPath),
      configPath,
      projectRoot: dirname(configPath)
    }))
  );

  return projects.sort((left, right) =>
    left.config.projectSlug.localeCompare(right.config.projectSlug)
  );
}

export async function resolveProjects(options: {
  all?: boolean;
  projectSlug?: string;
  repoRoot: string;
}): Promise<LoadedPostmanProject[]> {
  const projects = await discoverProjects(options.repoRoot);

  if (options.all) {
    return projects;
  }

  if (!options.projectSlug) {
    throw new Error("Provide --project <slug> or --all.");
  }

  const project = projects.find(
    (candidate) => candidate.config.projectSlug === options.projectSlug
  );

  if (!project) {
    throw new Error(`No Postman project config found for ${options.projectSlug}.`);
  }

  return [project];
}
