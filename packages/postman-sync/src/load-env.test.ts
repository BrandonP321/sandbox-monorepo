import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { loadLocalEnv } from "./load-env.js";

const ORIGINAL_POSTMAN_API_KEY = process.env.POSTMAN_API_KEY;

let tempDirectory: string | undefined;

beforeEach(() => {
  tempDirectory = mkdtempSync(join(tmpdir(), "postman-sync-env-"));
  delete process.env.POSTMAN_API_KEY;
});

afterEach(() => {
  if (tempDirectory) {
    rmSync(tempDirectory, { force: true, recursive: true });
  }

  if (ORIGINAL_POSTMAN_API_KEY === undefined) {
    delete process.env.POSTMAN_API_KEY;
  } else {
    process.env.POSTMAN_API_KEY = ORIGINAL_POSTMAN_API_KEY;
  }
});

describe("loadLocalEnv", () => {
  it("loads POSTMAN_API_KEY from repo-root .env.local", () => {
    if (!tempDirectory) {
      throw new Error("Expected temp directory to be initialized.");
    }

    writeFileSync(
      join(tempDirectory, ".env.local"),
      "POSTMAN_API_KEY=test-postman-key\n",
      "utf8"
    );

    const loadedFiles = loadLocalEnv(tempDirectory);

    expect(process.env.POSTMAN_API_KEY).toBe("test-postman-key");
    expect(loadedFiles).toEqual([{ path: join(tempDirectory, ".env.local") }]);
  });

  it("does not override an existing shell POSTMAN_API_KEY", () => {
    if (!tempDirectory) {
      throw new Error("Expected temp directory to be initialized.");
    }

    process.env.POSTMAN_API_KEY = "shell-postman-key";
    writeFileSync(
      join(tempDirectory, ".env.local"),
      "POSTMAN_API_KEY=file-postman-key\n",
      "utf8"
    );

    loadLocalEnv(tempDirectory);

    expect(process.env.POSTMAN_API_KEY).toBe("shell-postman-key");
  });

  it("does nothing when .env.local is absent", () => {
    if (!tempDirectory) {
      throw new Error("Expected temp directory to be initialized.");
    }

    const loadedFiles = loadLocalEnv(tempDirectory);

    expect(process.env.POSTMAN_API_KEY).toBeUndefined();
    expect(loadedFiles).toEqual([]);
  });
});
