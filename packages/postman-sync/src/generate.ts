import { getCollectionPath, getEnvironmentPath, getStatePath } from "./paths.js";
import { createEmptyPostmanState } from "./state.js";
import { writeJsonFile } from "./fs-utils.js";
import { generateCollection } from "./generate-collection.js";
import { generateEnvironments } from "./generate-environments.js";
import type {
  GeneratedPostmanArtifacts,
  LoadedPostmanProject,
  LoadedPostmanRequest
} from "./types.js";
import { existsSync } from "node:fs";

export function generateArtifacts(
  project: LoadedPostmanProject,
  requests: LoadedPostmanRequest[]
): GeneratedPostmanArtifacts {
  return {
    collection: generateCollection(project, requests),
    environments: generateEnvironments(project)
  };
}

export function writeGeneratedArtifacts(
  project: LoadedPostmanProject,
  artifacts: GeneratedPostmanArtifacts
): void {
  writeJsonFile(getCollectionPath(project), artifacts.collection);

  for (const [environmentKey, environment] of Object.entries(
    artifacts.environments
  )) {
    writeJsonFile(getEnvironmentPath(project, environmentKey), environment);
  }

  const statePath = getStatePath(project);
  if (!existsSync(statePath)) {
    writeJsonFile(statePath, createEmptyPostmanState());
  }
}
