import { existsSync, readFileSync } from "node:fs";

import { getCollectionPath, getEnvironmentPath } from "./paths.js";
import { stableJson, toPosixRelative } from "./fs-utils.js";
import type {
  GeneratedPostmanArtifacts,
  LoadedPostmanProject,
  LoadedPostmanRequest,
  PostmanCollection,
  PostmanEnvironmentFile
} from "./types.js";

type ValidationOptions = {
  checkStaleFiles?: boolean;
  repoRoot: string;
};

export function validateGeneratedArtifacts(
  project: LoadedPostmanProject,
  requests: LoadedPostmanRequest[],
  artifacts: GeneratedPostmanArtifacts,
  options: ValidationOptions
): void {
  const failures = [
    ...validateProject(project),
    ...validateRequests(project, requests),
    ...validateCollection(artifacts.collection),
    ...validateEnvironments(artifacts.environments),
    ...validateSecretScan(artifacts),
    ...(options.checkStaleFiles
      ? validateStaleFiles(project, artifacts, options.repoRoot)
      : [])
  ];

  if (failures.length > 0) {
    throw new Error(
      [
        `Postman validation failed for ${project.config.projectSlug}:`,
        ...failures.map((failure) => `- ${failure}`)
      ].join("\n")
    );
  }
}

function validateProject(project: LoadedPostmanProject): string[] {
  const failures: string[] = [];

  if (!project.config.projectSlug.trim()) {
    failures.push("Project slug is required.");
  }

  if (!project.config.postman.workspaceName.trim()) {
    failures.push("Postman workspace name is required.");
  }

  if (!project.config.postman.collectionName.trim()) {
    failures.push("Postman collection name is required.");
  }

  return failures;
}

function validateRequests(
  project: LoadedPostmanProject,
  requests: LoadedPostmanRequest[]
): string[] {
  const failures: string[] = [];
  const seenRouteNames = new Set<string>();

  for (const request of requests) {
    const { config } = request;

    if (seenRouteNames.has(config.routeName)) {
      failures.push(`Duplicate request routeName '${config.routeName}'.`);
    }

    seenRouteNames.add(config.routeName);

    if (project.config.routes && !project.config.routes[config.routeName]) {
      failures.push(`Unknown routeName '${config.routeName}'.`);
    }

    const expectedRoute = project.config.routes?.[config.routeName];
    if (
      expectedRoute &&
      (expectedRoute.method !== config.route.method ||
        expectedRoute.path !== config.route.path)
    ) {
      failures.push(`Route '${config.routeName}' does not match project routes.`);
    }

    if (config.requestSchema && config.exampleBody === undefined) {
      failures.push(`Route '${config.routeName}' has a request schema but no exampleBody.`);
    }

    const result = config.requestSchema?.safeParse(config.exampleBody);
    if (result && !result.success) {
      failures.push(`Route '${config.routeName}' has an invalid exampleBody.`);
    }
  }

  return failures;
}

function validateCollection(collection: PostmanCollection): string[] {
  const failures: string[] = [];

  if (
    collection.info.schema !==
    "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  ) {
    failures.push("Generated collection is not Postman Collection v2.1.");
  }

  if (collection.item.length === 0) {
    failures.push("Generated collection has no requests.");
  }

  return failures;
}

function validateEnvironments(
  environments: Record<string, PostmanEnvironmentFile>
): string[] {
  const failures: string[] = [];

  for (const [environmentKey, environment] of Object.entries(environments)) {
    const baseUrl = environment.values.find((value) => value.key === "baseUrl");

    if (!baseUrl || !baseUrl.enabled || baseUrl.value.trim() === "") {
      failures.push(`Environment '${environmentKey}' is missing enabled baseUrl.`);
    }
  }

  return failures;
}

function validateSecretScan(artifacts: GeneratedPostmanArtifacts): string[] {
  const content = JSON.stringify(artifacts);
  const secretPatterns = [
    /PMAK-[A-Za-z0-9-]+/,
    /postman_api_key/i,
    /(?:api|auth|access|refresh)[_-]?token["']?\s*:\s*["'][^"'{][^"']{8,}/i
  ];

  return secretPatterns.some((pattern) => pattern.test(content))
    ? ["Generated artifacts contain secret-looking values."]
    : [];
}

function validateStaleFiles(
  project: LoadedPostmanProject,
  artifacts: GeneratedPostmanArtifacts,
  repoRoot: string
): string[] {
  const failures: string[] = [];
  const collectionPath = getCollectionPath(project);

  if (!matchesGeneratedFile(collectionPath, artifacts.collection)) {
    failures.push(`${toPosixRelative(repoRoot, collectionPath)} is stale.`);
  }

  for (const [environmentKey, environment] of Object.entries(
    artifacts.environments
  )) {
    const environmentPath = getEnvironmentPath(project, environmentKey);

    if (!matchesGeneratedFile(environmentPath, environment)) {
      failures.push(`${toPosixRelative(repoRoot, environmentPath)} is stale.`);
    }
  }

  return failures;
}

function matchesGeneratedFile(filePath: string, generatedValue: unknown): boolean {
  return existsSync(filePath) && readFileSync(filePath, "utf8") === stableJson(generatedValue);
}
