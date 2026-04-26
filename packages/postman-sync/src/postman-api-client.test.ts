import { afterEach, describe, expect, it, vi } from "vitest";

import { PostmanApiClient, resolveWorkspaceId } from "./postman-api-client.js";

describe("PostmanApiClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("resolves workspaces by exact name", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          workspaces: [{ id: "workspace-1", name: "Sandbox / Example" }]
        })
      )
    );
    const client = new PostmanApiClient("test-key");

    await expect(resolveWorkspaceId(client, "Sandbox / Example")).resolves.toBe(
      "workspace-1"
    );
  });

  it("creates collections in the configured workspace", async () => {
    const fetchMock = vi.fn(async (_url: string | URL, init?: RequestInit) =>
      Response.json({
        collection: {
          uid: "collection-1"
        },
        requestBody: init?.body
      })
    );
    vi.stubGlobal("fetch", fetchMock);
    const client = new PostmanApiClient("test-key");

    await expect(
      client.createCollection("workspace-1", {
        info: {
          name: "Example API",
          schema:
            "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        item: []
      })
    ).resolves.toBe("collection-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.getpostman.com/collections?workspace=workspace-1",
      expect.objectContaining({
        method: "POST"
      })
    );
  });
});
