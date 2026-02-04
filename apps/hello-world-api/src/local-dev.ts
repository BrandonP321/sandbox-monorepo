import { createServer } from "node:http";

import { handleRequest } from "./routes";

const port = Number(process.env.PORT ?? 3001);

const server = createServer((request, response) => {
  const method = request.method ?? "GET";
  const url = new URL(request.url ?? "/", `http://localhost:${port}`);
  const result = handleRequest(method, url.pathname);

  response.writeHead(result.statusCode, result.headers);
  response.end(result.body);
});

server.listen(port, () => {
  console.log(`Hello World API listening on http://localhost:${port}`);
});
