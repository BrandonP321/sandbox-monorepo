import { existsSync } from "node:fs";

import { getStatePath } from "./paths.js";
import { readJsonFile, writeJsonFile } from "./fs-utils.js";
import type { LoadedPostmanProject, PostmanState } from "./types.js";

export function createEmptyPostmanState(): PostmanState {
  return {
    collectionUid: null,
    environments: {}
  };
}

export function readPostmanState(project: LoadedPostmanProject): PostmanState {
  const statePath = getStatePath(project);

  if (!existsSync(statePath)) {
    return createEmptyPostmanState();
  }

  return readJsonFile<PostmanState>(statePath);
}

export function writePostmanState(
  project: LoadedPostmanProject,
  state: PostmanState
): void {
  writeJsonFile(getStatePath(project), state);
}
