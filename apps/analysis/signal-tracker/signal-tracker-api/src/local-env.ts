import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";

type LoadedLocalEnvFile = {
  path: string;
};

export function loadSignalTrackerLocalEnv(
  envPath = findSignalTrackerLocalEnvPath()
): LoadedLocalEnvFile | undefined {
  if (!existsSync(envPath)) {
    return undefined;
  }

  loadEnvFile(envPath);

  return { path: envPath };
}

export function findSignalTrackerLocalEnvPath(
  startDirectory = process.cwd()
): string {
  const candidates = [
    resolve(startDirectory, "apps/analysis/signal-tracker/.env.local"),
    resolve(startDirectory, "../.env.local"),
    resolve(startDirectory, ".env.local")
  ];

  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0];
}
