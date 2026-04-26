import { PostmanApiClient, resolveWorkspaceId } from "./postman-api-client.js";
import { readPostmanState, writePostmanState } from "./state.js";
import type {
  GeneratedPostmanArtifacts,
  LoadedPostmanProject,
  PostmanState
} from "./types.js";

export async function syncProjectToPostman(
  project: LoadedPostmanProject,
  artifacts: GeneratedPostmanArtifacts,
  apiKey: string
): Promise<PostmanState> {
  const client = new PostmanApiClient(apiKey);
  const workspaceId = await resolveWorkspaceId(
    client,
    project.config.postman.workspaceName
  );
  const state = readPostmanState(project);

  state.collectionUid = state.collectionUid
    ? await client.updateCollection(state.collectionUid, artifacts.collection)
    : await client.createCollection(workspaceId, artifacts.collection);

  for (const [environmentKey, environment] of Object.entries(
    artifacts.environments
  )) {
    const currentEnvironment = state.environments[environmentKey];
    const uid = currentEnvironment
      ? await client.updateEnvironment(currentEnvironment.uid, environment)
      : await client.createEnvironment(workspaceId, environment);

    state.environments[environmentKey] = { uid };
  }

  writePostmanState(project, state);

  return state;
}
