import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { readConnection } from "./connection.js";
import { instructions } from "./mcp.js";

// The packaged bridge has no fixture state and no owner credential. All tool calls go through authenticated HTTP.
const role = process.argv.includes("--read-only") ? "reader" : "editor";
const connection = await readConnection(role);
const client = new Client({
  name: "timelines-plugin-bridge",
  version: "0.1.0"
});
await client.connect(
  new StreamableHTTPClientTransport(new URL(`${connection.url}/mcp`), {
    requestInit: { headers: { Authorization: `Bearer ${connection.token}` } }
  })
);
const server = new Server(
  { name: "timelines-fixture", version: "0.1.0" },
  { capabilities: { tools: {} }, instructions }
);
server.setRequestHandler(ListToolsRequestSchema, () => client.listTools());
server.setRequestHandler(CallToolRequestSchema, (request) =>
  client.callTool(request.params)
);
server.onclose = () => {
  void client.close();
};
await server.connect(new StdioServerTransport());
