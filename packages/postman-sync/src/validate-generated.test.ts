import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";
import { z } from "zod";

import { generateArtifacts, writeGeneratedArtifacts } from "./generate.js";
import { validateGeneratedArtifacts } from "./validate-generated.js";
import type {
  LoadedPostmanProject,
  LoadedPostmanRequest
} from "./types.js";

function createProject(projectRoot: string): LoadedPostmanProject {
  return {
    configPath: join(projectRoot, "postman.config.ts"),
    projectRoot,
    config: {
      displayName: "Example",
      projectSlug: "example",
      postman: {
        collectionName: "Example API",
        workspaceName: "Sandbox / Example"
      },
      requestConfigGlobs: ["example-api/src/routes/**/*.postman-config.ts"],
      routes: {
        createThing: {
          method: "POST",
          path: "/create-thing"
        }
      },
      environments: {
        local: {
          name: "Example - Local",
          values: {
            baseUrl: {
              value: "http://localhost:3001"
            }
          }
        }
      }
    }
  };
}

function createRequest(routeName = "createThing"): LoadedPostmanRequest {
  return {
    configPath: "create-thing.postman-config.ts",
    config: {
      routeName,
      route: {
        method: "POST",
        path: "/create-thing"
      },
      name: "Create Thing",
      requestSchema: z.object({
        title: z.string().min(1)
      }),
      exampleBody: {
        title: "Example"
      }
    }
  };
}

describe("validateGeneratedArtifacts", () => {
  it("accepts current generated files", () => {
    const projectRoot = mkdtempSync(join(tmpdir(), "postman-sync-"));
    const project = createProject(projectRoot);
    const requests = [createRequest()];
    const artifacts = generateArtifacts(project, requests);

    writeGeneratedArtifacts(project, artifacts);

    expect(() =>
      validateGeneratedArtifacts(project, requests, artifacts, {
        checkStaleFiles: true,
        repoRoot: projectRoot
      })
    ).not.toThrow();
  });

  it("rejects unknown route names", () => {
    const projectRoot = mkdtempSync(join(tmpdir(), "postman-sync-"));
    const project = createProject(projectRoot);
    const requests = [createRequest("missingRoute")];
    const artifacts = generateArtifacts(project, requests);

    expect(() =>
      validateGeneratedArtifacts(project, requests, artifacts, {
        repoRoot: projectRoot
      })
    ).toThrow("Unknown routeName");
  });

  it("rejects invalid example bodies", () => {
    const projectRoot = mkdtempSync(join(tmpdir(), "postman-sync-"));
    const project = createProject(projectRoot);
    const request = createRequest();
    request.config.exampleBody = {
      title: ""
    };
    const artifacts = generateArtifacts(project, [request]);

    expect(() =>
      validateGeneratedArtifacts(project, [request], artifacts, {
        repoRoot: projectRoot
      })
    ).toThrow("invalid exampleBody");
  });

  it("rejects stale generated files", () => {
    const projectRoot = mkdtempSync(join(tmpdir(), "postman-sync-"));
    const project = createProject(projectRoot);
    const requests = [createRequest()];
    const artifacts = generateArtifacts(project, requests);

    writeGeneratedArtifacts(project, artifacts);
    writeFileSync(
      join(projectRoot, ".postman", "collection.generated.json"),
      "{}\n",
      "utf8"
    );

    expect(() =>
      validateGeneratedArtifacts(project, requests, artifacts, {
        checkStaleFiles: true,
        repoRoot: projectRoot
      })
    ).toThrow("collection.generated.json is stale");
  });
});
