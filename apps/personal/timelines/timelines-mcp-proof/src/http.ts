import { randomBytes, timingSafeEqual } from "node:crypto";
import { createServer, type IncomingMessage } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { idSchema, ProofError } from "./contracts.js";
import { createMcp } from "./mcp.js";
import { FixtureStore } from "./store.js";

export const createCredentials = () => ({
  reader: randomBytes(32).toString("hex"),
  editor: randomBytes(32).toString("hex"),
  owner: randomBytes(32).toString("hex")
});
export type Credentials = ReturnType<typeof createCredentials>;
const approvalSchema = z.strictObject({
  proposalId: idSchema,
  digest: z.string().regex(/^[a-f0-9]{64}$/)
});

function matches(header: string | undefined, token: string) {
  const supplied = Buffer.from(header ?? "");
  const expected = Buffer.from(`Bearer ${token}`);
  return (
    supplied.length === expected.length && timingSafeEqual(supplied, expected)
  );
}

async function body(request: IncomingMessage) {
  const chunks: Buffer[] = [];
  let length = 0;
  for await (const chunk of request) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    length += bytes.length;
    if (length > 64 * 1024) throw new ProofError("PAYLOAD_TOO_LARGE");
    chunks.push(bytes);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

export async function startFixture(
  options: {
    port?: number;
    credentials?: Credentials;
    store?: FixtureStore;
  } = {}
) {
  const credentials = options.credentials ?? createCredentials();
  const store = options.store ?? new FixtureStore();
  const server = createServer(async (request, response) => {
    response.setHeader("Cache-Control", "no-store");
    const fail = (status: number, error: string) => {
      response.writeHead(status, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error }));
    };
    if (request.headers.host !== new URL(url).host || request.headers.origin)
      return fail(403, "LOCAL_ONLY");
    const auth = request.headers.authorization;
    if (request.url?.startsWith("/owner/")) {
      if (!matches(auth, credentials.owner)) return fail(401, "UNAUTHORIZED");
      try {
        if (
          request.method === "GET" &&
          request.url.startsWith("/owner/proposals/")
        ) {
          const proposal = store.getProposal(
            idSchema.parse(request.url.slice("/owner/proposals/".length))
          );
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify(proposal));
        } else if (
          request.method === "POST" &&
          request.url === "/owner/approve"
        ) {
          const input = approvalSchema.parse(await body(request));
          response.setHeader("Content-Type", "application/json");
          response.end(
            JSON.stringify(store.approve(input.proposalId, input.digest))
          );
        } else fail(404, "NOT_FOUND");
      } catch (error) {
        fail(400, error instanceof ProofError ? error.code : "INVALID_INPUT");
      }
      return;
    }
    const role = matches(auth, credentials.editor)
      ? "editor"
      : matches(auth, credentials.reader)
        ? "reader"
        : null;
    if (!role) {
      response.setHeader(
        "WWW-Authenticate",
        'Bearer realm="timelines-fixture"'
      );
      return fail(401, "UNAUTHORIZED");
    }
    if (request.url !== "/mcp") return fail(404, "NOT_FOUND");
    if (request.method !== "POST") return fail(405, "METHOD_NOT_ALLOWED");
    const mcp = createMcp(store, role);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true
    });
    response.on("close", () => {
      void mcp.close();
    });
    try {
      const input = await body(request);
      await mcp.connect(transport);
      await transport.handleRequest(request, response, input);
    } catch (error) {
      if (!response.headersSent)
        fail(
          error instanceof ProofError && error.code === "PAYLOAD_TOO_LARGE"
            ? 413
            : 400,
          "INVALID_REQUEST"
        );
    }
  });
  let url = "";
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(options.port ?? 0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Expected TCP listener");
  url = `http://127.0.0.1:${address.port}`;
  return {
    url,
    credentials,
    store,
    close: () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve()))
      )
  };
}
