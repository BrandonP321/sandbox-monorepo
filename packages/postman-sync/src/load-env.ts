import { existsSync } from "node:fs";
import { join } from "node:path";

import { config as loadDotenv } from "dotenv";

export type LoadedEnvFile = {
  path: string;
};

export function loadLocalEnv(repoRoot: string): LoadedEnvFile[] {
  const envPath = join(repoRoot, ".env.local");

  if (!existsSync(envPath)) {
    return [];
  }

  const result = loadDotenv({
    override: false,
    path: envPath,
    quiet: true
  });

  if (result.error) {
    throw result.error;
  }

  return [{ path: envPath }];
}
