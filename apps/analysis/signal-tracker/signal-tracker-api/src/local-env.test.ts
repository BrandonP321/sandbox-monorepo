import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  findSignalTrackerLocalEnvPath,
  loadSignalTrackerLocalEnv
} from "./local-env";

describe("loadSignalTrackerLocalEnv", () => {
  const loadedKey = "SIGNAL_TRACKER_TEST_ENV_LOADED";
  const existingKey = "SIGNAL_TRACKER_TEST_ENV_EXISTING";
  let tempDirectory: string | undefined;

  afterEach(() => {
    delete process.env[loadedKey];
    delete process.env[existingKey];

    if (tempDirectory) {
      rmSync(tempDirectory, { force: true, recursive: true });
      tempDirectory = undefined;
    }
  });

  it("does nothing when the local env file is absent", () => {
    tempDirectory = mkdtempSync(join(tmpdir(), "signal-tracker-env-"));
    const envPath = join(tempDirectory, ".env.local");

    expect(loadSignalTrackerLocalEnv(envPath)).toBeUndefined();
    expect(process.env[loadedKey]).toBeUndefined();
  });

  it("loads a local env file without overriding shell-provided values", () => {
    tempDirectory = mkdtempSync(join(tmpdir(), "signal-tracker-env-"));
    const envPath = join(tempDirectory, ".env.local");
    process.env[existingKey] = "from-shell";
    writeFileSync(
      envPath,
      `${loadedKey}=from-file\n${existingKey}=from-file\n`,
      "utf8"
    );

    expect(loadSignalTrackerLocalEnv(envPath)).toEqual({ path: envPath });
    expect(process.env[loadedKey]).toBe("from-file");
    expect(process.env[existingKey]).toBe("from-shell");
  });

  it("finds the project-local env file from the API package directory", () => {
    tempDirectory = mkdtempSync(join(tmpdir(), "signal-tracker-env-"));
    const apiDirectory = join(
      tempDirectory,
      "apps",
      "analysis",
      "signal-tracker",
      "signal-tracker-api"
    );
    const envPath = join(
      tempDirectory,
      "apps",
      "analysis",
      "signal-tracker",
      ".env.local"
    );
    mkdirSync(apiDirectory, { recursive: true });
    writeFileSync(envPath, `${loadedKey}=from-file\n`, "utf8");

    expect(findSignalTrackerLocalEnvPath(apiDirectory)).toBe(envPath);
  });
});
