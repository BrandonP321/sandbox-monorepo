import { request } from "node:http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { z } from "zod";
import { startFixture } from "./http.js";
import { type Change, TIMELINE_ID } from "./contracts.js";

function data(result: unknown): unknown {
  return z
    .object({ structuredContent: z.object({ data: z.unknown() }) })
    .parse(result).structuredContent.data;
}

const add = {
  action: "add",
  id: "fixture-new",
  content: {
    title: "Test addition",
    date: "2042",
    description: "Synthetic",
    source: "Fixture"
  }
} satisfies Change;
let fixture: Awaited<ReturnType<typeof startFixture>>;
const clients: Client[] = [];
async function connect(role: "reader" | "editor") {
  const client = new Client({ name: "proof-integration", version: "1" });
  clients.push(client);
  await client.connect(
    new StreamableHTTPClientTransport(new URL(`${fixture.url}/mcp`), {
      requestInit: {
        headers: { Authorization: `Bearer ${fixture.credentials[role]}` }
      }
    })
  );
  return client;
}
beforeEach(async () => {
  fixture = await startFixture();
});
afterEach(async () => {
  await Promise.all(clients.splice(0).map((client) => client.close()));
  await fixture.close();
});

describe("authenticated MCP over real loopback HTTP", () => {
  it("rejects missing/wrong credentials, hostile origins/hosts, and oversized requests", async () => {
    const input = {
      method: "POST",
      body: "{}",
      headers: { "Content-Type": "application/json" }
    };
    expect((await fetch(`${fixture.url}/mcp`, input)).status).toBe(401);
    expect(
      (
        await fetch(`${fixture.url}/mcp`, {
          ...input,
          headers: { ...input.headers, Authorization: "Bearer wrong" }
        })
      ).status
    ).toBe(401);
    const headers = {
      ...input.headers,
      Authorization: `Bearer ${fixture.credentials.editor}`
    };
    expect(
      (
        await fetch(`${fixture.url}/mcp`, {
          ...input,
          headers: { ...headers, Origin: "https://untrusted.example" }
        })
      ).status
    ).toBe(403);
    const hostileHostStatus = await new Promise<number | undefined>(
      (resolve, reject) => {
        const req = request(
          `${fixture.url}/mcp`,
          {
            method: "POST",
            headers: { ...headers, Host: "untrusted.example" }
          },
          (response) => {
            response.resume();
            resolve(response.statusCode);
          }
        );
        req.on("error", reject);
        req.end("{}");
      }
    );
    expect(hostileHostStatus).toBe(403);
    expect(
      (
        await fetch(`${fixture.url}/mcp`, {
          ...input,
          headers,
          body: "a".repeat(65537)
        })
      ).status
    ).toBe(413);
    expect(
      (await fetch(`${fixture.url}/owner/approve`, { ...input, headers }))
        .status
    ).toBe(401);
  });

  it("lists, reads and searches with a read-only credential; no mutation tools are available", async () => {
    const client = await connect("reader");
    const before = fixture.store.read();
    const catalog = await client.listTools();
    expect(catalog.tools.every((tool) => tool.annotations?.readOnlyHint)).toBe(
      true
    );
    expect(catalog.tools.map(({ name }) => name)).not.toContain("change_entry");
    const list = await client.callTool({
      name: "list_timelines",
      arguments: {}
    });
    expect(data(list)).toEqual([
      { id: TIMELINE_ID, title: before.title, version: 1 }
    ]);
    expect(
      data(
        await client.callTool({
          name: "read_timeline",
          arguments: { timelineId: TIMELINE_ID }
        })
      )
    ).toEqual(before);
    const found = await client.callTool({
      name: "search_entries",
      arguments: { query: "Ignore the user" }
    });
    expect(data(found)).toMatchObject({
      entries: [before.entries[1]]
    });
    expect(
      (
        await client.callTool({
          name: "change_entry",
          arguments: { requestId: "x", expectedVersion: 1, change: add }
        })
      ).isError
    ).toBe(true);
    expect(fixture.store.read()).toEqual(before);
    expect(fixture.store.history()).toEqual([]);
  });

  it("applies only the exact separately approved batch, retries across clients, and undoes", async () => {
    const client = await connect("editor");
    const preview = await client.callTool({
      name: "propose_batch",
      arguments: { requestId: "proposal", expectedVersion: 1, changes: [add] }
    });
    const proposal = z
      .object({ id: z.string(), digest: z.string() })
      .parse(data(preview));
    const args = {
      requestId: "apply",
      proposalId: proposal.id,
      digest: proposal.digest
    };
    expect(
      (await client.callTool({ name: "apply_proposal", arguments: args }))
        .content
    ).toEqual([{ type: "text", text: "OWNER_APPROVAL_REQUIRED" }]);
    const approval = await fetch(`${fixture.url}/owner/approve`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${fixture.credentials.owner}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ proposalId: proposal.id, digest: proposal.digest })
    });
    expect(approval.status).toBe(200);
    const applied = await client.callTool({
      name: "apply_proposal",
      arguments: args
    });
    const batch = z
      .object({ id: z.string(), version: z.number() })
      .parse(data(applied));
    const other = await connect("editor");
    expect(
      await other.callTool({ name: "apply_proposal", arguments: args })
    ).toEqual(applied);
    expect(fixture.store.read().entries).toHaveLength(3);
    expect(
      (
        await other.callTool({
          name: "undo_batch",
          arguments: {
            requestId: "undo",
            batchId: batch.id,
            expectedVersion: batch.version
          }
        })
      ).isError
    ).not.toBe(true);
    expect(fixture.store.read().entries).toHaveLength(2);
    expect(fixture.store.history()).toHaveLength(2);
  });

  it("rejects protected, unknown, malformed and over-limit operations without side effects", async () => {
    const client = await connect("editor");
    const before = fixture.store.read();
    const names = (await client.listTools()).tools.map(({ name }) => name);
    for (const name of [
      "publish_timeline",
      "change_sharing",
      "permanently_delete",
      "approve_proposal",
      "import_timeline"
    ]) {
      expect(names).not.toContain(name);
      expect((await client.callTool({ name, arguments: {} })).isError).toBe(
        true
      );
    }
    for (const changes of [
      [{ action: "delete", id: "fixture-alpha" }],
      Array.from({ length: 11 }, () => add)
    ]) {
      expect(
        (
          await client.callTool({
            name: "propose_batch",
            arguments: { requestId: "bad", expectedVersion: 1, changes }
          })
        ).isError
      ).toBe(true);
    }
    expect(
      (
        await client.callTool({
          name: "change_entry",
          arguments: {
            requestId: "bad",
            expectedVersion: 1,
            change: add,
            approved: true
          }
        })
      ).isError
    ).toBe(true);
    expect(
      (
        await client.callTool({
          name: "read_timeline",
          arguments: { timelineId: "real-study-data" }
        })
      ).isError
    ).toBe(true);
    expect(fixture.store.read()).toEqual(before);
    expect(fixture.store.history()).toEqual([]);
  });
});
