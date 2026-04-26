import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export function findRepoRoot(startDirectory = process.cwd()): string {
  let current = resolve(startDirectory);

  while (current !== dirname(current)) {
    if (existsSync(join(current, "pnpm-workspace.yaml"))) {
      return current;
    }

    current = dirname(current);
  }

  throw new Error("Could not find repo root from current directory.");
}

export async function importDefault<T>(filePath: string): Promise<T> {
  const moduleUrl = pathToFileURL(filePath).href;
  const loaded = (await import(`${moduleUrl}?t=${Date.now()}`)) as {
    default?: T;
  };

  if (!loaded.default) {
    throw new Error(`Expected default export from ${filePath}`);
  }

  return loaded.default;
}

export function listFilesRecursive(directory: string): string[] {
  if (!existsSync(directory)) {
    return [];
  }

  const files: string[] = [];

  for (const entry of readdirSync(directory)) {
    const entryPath = join(directory, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      files.push(...listFilesRecursive(entryPath));
      continue;
    }

    if (stats.isFile()) {
      files.push(entryPath);
    }
  }

  return files.sort();
}

export function readJsonFile<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

export function writeJsonFile(filePath: string, value: unknown): void {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, stableJson(value), "utf8");
}

export function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function toPosixRelative(from: string, to: string): string {
  return relative(from, to).replace(/\\/g, "/");
}
