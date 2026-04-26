import { join } from "node:path";

import { importDefault, listFilesRecursive } from "./fs-utils.js";
import type {
  LoadedPostmanProject,
  LoadedPostmanRequest,
  PostmanRequestConfig
} from "./types.js";

export async function discoverRequestConfigs(
  project: LoadedPostmanProject
): Promise<LoadedPostmanRequest[]> {
  const configPaths = project.config.requestConfigGlobs.flatMap((globPattern) =>
    resolveGlob(project.projectRoot, globPattern)
  );
  const uniqueConfigPaths = [...new Set(configPaths)].sort();

  return Promise.all(
    uniqueConfigPaths.map(async (configPath) => ({
      config: await importDefault<PostmanRequestConfig>(configPath),
      configPath
    }))
  );
}

function resolveGlob(projectRoot: string, globPattern: string): string[] {
  const normalized = globPattern.replace(/\\/g, "/");
  const wildcardIndex = normalized.indexOf("**");

  if (wildcardIndex === -1) {
    return [join(projectRoot, normalized)];
  }

  const basePattern = normalized.slice(0, wildcardIndex).replace(/\/$/, "");
  const suffixPattern = normalized
    .slice(wildcardIndex + 2)
    .replace(/^\//, "")
    .replace(/^\*/, "");
  const baseDirectory = join(projectRoot, basePattern);

  return listFilesRecursive(baseDirectory).filter((filePath) =>
    filePath.replace(/\\/g, "/").endsWith(suffixPattern)
  );
}
