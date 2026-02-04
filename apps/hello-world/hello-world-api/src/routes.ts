export type HandlerResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,OPTIONS",
  "access-control-allow-headers": "content-type"
};

const JSON_HEADERS = {
  "content-type": "application/json",
  ...CORS_HEADERS
};

function jsonResponse(statusCode: number, payload: unknown): HandlerResponse {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(payload)
  };
}

export function handleRequest(method: string, path: string): HandlerResponse {
  if (method === "OPTIONS") {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: ""
    };
  }

  if (method === "GET" && path === "/hello") {
    return jsonResponse(200, { message: "Hello World (backend)" });
  }

  if (method === "GET" && path === "/healthz") {
    return jsonResponse(200, { ok: true });
  }

  return jsonResponse(404, { message: "Not Found" });
}
