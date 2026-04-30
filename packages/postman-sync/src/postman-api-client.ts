import type { PostmanCollection, PostmanEnvironmentFile } from "./types.js";

const POSTMAN_API_BASE_URL = "https://api.getpostman.com";

export type PostmanWorkspace = {
  id: string;
  name: string;
};

type CollectionMutationResponse = {
  collection?: {
    id?: string;
    uid?: string;
  };
};

type EnvironmentMutationResponse = {
  environment?: {
    id?: string;
    uid?: string;
  };
};

export class PostmanApiClient {
  constructor(private readonly apiKey: string) {}

  async listWorkspaces(): Promise<PostmanWorkspace[]> {
    const response = await this.request<{ workspaces?: PostmanWorkspace[] }>(
      "GET",
      "/workspaces"
    );

    return response.workspaces ?? [];
  }

  async createCollection(
    workspaceId: string,
    collection: PostmanCollection
  ): Promise<string> {
    const response = await this.request<CollectionMutationResponse>(
      "POST",
      `/collections?workspace=${encodeURIComponent(workspaceId)}`,
      { collection }
    );

    return getRemoteId(response.collection, "collection");
  }

  async updateCollection(
    collectionUid: string,
    collection: PostmanCollection
  ): Promise<string> {
    const response = await this.request<CollectionMutationResponse>(
      "PUT",
      `/collections/${encodeURIComponent(collectionUid)}`,
      { collection }
    );

    return getRemoteId(response.collection, "collection") ?? collectionUid;
  }

  async createEnvironment(
    workspaceId: string,
    environment: PostmanEnvironmentFile
  ): Promise<string> {
    const response = await this.request<EnvironmentMutationResponse>(
      "POST",
      `/environments?workspace=${encodeURIComponent(workspaceId)}`,
      { environment }
    );

    return getRemoteId(response.environment, "environment");
  }

  async updateEnvironment(
    environmentUid: string,
    environment: PostmanEnvironmentFile
  ): Promise<string> {
    const response = await this.request<EnvironmentMutationResponse>(
      "PUT",
      `/environments/${encodeURIComponent(environmentUid)}`,
      { environment }
    );

    return getRemoteId(response.environment, "environment") ?? environmentUid;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const response = await fetch(`${POSTMAN_API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": this.apiKey
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Postman API ${method} ${path} failed with ${response.status}: ${text}`
      );
    }

    return (await response.json()) as T;
  }
}

export async function resolveWorkspaceId(
  client: PostmanApiClient,
  workspaceName: string
): Promise<string> {
  const matches = (await client.listWorkspaces()).filter(
    (workspace) => workspace.name === workspaceName
  );

  if (matches.length === 0) {
    throw new Error(`No Postman workspace found named '${workspaceName}'.`);
  }

  if (matches.length > 1) {
    throw new Error(
      `Multiple Postman workspaces found named '${workspaceName}'.`
    );
  }

  return matches[0].id;
}

function getRemoteId(
  resource: { id?: string; uid?: string } | undefined,
  resourceName: string
): string {
  const remoteId = resource?.uid ?? resource?.id;

  if (!remoteId) {
    throw new Error(`Postman API response did not include ${resourceName} id.`);
  }

  return remoteId;
}
