import { describe, expect, it } from "vitest";
import { z } from "zod";

import { generateCollection } from "./generate-collection.js";
import { generateEnvironments } from "./generate-environments.js";
import type { LoadedPostmanProject, LoadedPostmanRequest } from "./types.js";

const project: LoadedPostmanProject = {
  configPath: "apps/example/postman.config.ts",
  projectRoot: "apps/example",
  config: {
    displayName: "Example",
    projectSlug: "example",
    postman: {
      collectionName: "Example API",
      workspaceName: "Sandbox / Example"
    },
    requestConfigGlobs: ["example-api/src/routes/**/*.postman-config.ts"],
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

const request: LoadedPostmanRequest = {
  configPath: "apps/example/example-api/src/routes/create.postman-config.ts",
  config: {
    routeName: "createThing",
    route: {
      method: "POST",
      path: "/create-thing"
    },
    folder: "Things",
    name: "Create Thing",
    description: "Creates a thing.",
    requestSchema: z.object({
      title: z.string()
    }),
    exampleBody: {
      title: "Example"
    }
  }
};

describe("generateCollection", () => {
  it("generates a Postman v2.1 collection with folders and request bodies", () => {
    const collection = generateCollection(project, [request]);

    expect(collection.info).toMatchObject({
      name: "Example API",
      schema:
        "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    });
    expect(collection.item[0]).toMatchObject({
      name: "Things",
      item: [
        {
          name: "Create Thing",
          request: {
            method: "POST",
            body: {
              raw: '{\n  "title": "Example"\n}'
            },
            url: {
              raw: "{{baseUrl}}/create-thing"
            }
          }
        }
      ]
    });
  });
});

describe("generateEnvironments", () => {
  it("generates deterministic environment files", () => {
    expect(generateEnvironments(project)).toEqual({
      local: {
        name: "Example - Local",
        values: [
          {
            key: "baseUrl",
            value: "http://localhost:3001",
            enabled: true,
            type: "default"
          }
        ]
      }
    });
  });
});
