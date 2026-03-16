import { createServer } from "node:http";

export type ApiRequest = {
  method: string;
  path: string;
  headers?: Record<string, string | undefined>;
  body?: string | null;
  requestId?: string;
};

export type ApiResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

export type RouteHandler = (
  request: ApiRequest
) => Promise<ApiResponse> | ApiResponse;

export type RouteDefinition = {
  method: string;
  path: string;
  handler: RouteHandler;
};

export type RouteSpec = Omit<RouteDefinition, "handler">;

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST,OPTIONS",
  "access-control-allow-headers": "content-type,authorization"
};

const JSON_HEADERS = {
  "content-type": "application/json",
  ...CORS_HEADERS
};

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode = 400
  ) {
    super(message);
  }
}

export const responses = {
  json(statusCode: number, payload: unknown): ApiResponse {
    return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(payload) };
  },
  ok(payload: unknown): ApiResponse {
    return responses.json(200, payload);
  },
  error(statusCode: number, code: string, message: string): ApiResponse {
    return responses.json(statusCode, { error: { code, message } });
  },
  noContent(): ApiResponse {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }
};

export type Logger = (entry: Record<string, unknown>) => void;

export function createLogger(): Logger {
  return (entry) => {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), ...entry }));
  };
}

export function createPostRoute(fileName: string, handler: RouteHandler): RouteDefinition {
  return {
    method: "POST",
    path: `/${fileName.replace(/\.[^.]+$/, "")}`,
    handler
  };
}

export function createRoute(route: RouteSpec, handler: RouteHandler): RouteDefinition {
  return {
    ...route,
    handler
  };
}

export function createRouter(
  routes: RouteDefinition[],
  logger: Logger = createLogger()
) {
  const routeMap = new Map<string, RouteHandler>();
  for (const route of routes) {
    routeMap.set(`${route.method.toUpperCase()} ${route.path}`, route.handler);
  }

  return async (request: ApiRequest): Promise<ApiResponse> => {
    if (request.method.toUpperCase() === "OPTIONS") {
      return responses.noContent();
    }

    const key = `${request.method.toUpperCase()} ${request.path}`;
    const handler = routeMap.get(key);
    logger({ level: "info", event: "request", requestId: request.requestId, route: key });

    if (!handler) {
      return responses.error(404, "NOT_FOUND", "Not Found");
    }

    try {
      const result = await handler(request);
      logger({
        level: "info",
        event: "response",
        requestId: request.requestId,
        route: key,
        statusCode: result.statusCode
      });
      return result;
    } catch (error) {
      if (error instanceof AppError) {
        return responses.error(error.statusCode, error.code, error.message);
      }

      logger({
        level: "error",
        event: "unhandled_error",
        requestId: request.requestId,
        route: key,
        message: error instanceof Error ? error.message : "unknown"
      });
      return responses.error(500, "INTERNAL_ERROR", "Internal Server Error");
    }
  };
}

export function startLocalDevServer(
  appRouter: (request: ApiRequest) => Promise<ApiResponse>,
  options?: { port?: number; appName?: string }
) {
  const port = options?.port ?? Number(process.env.PORT ?? 3001);
  const appName = options?.appName ?? "API";

  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", `http://localhost:${port}`);
    const result = await appRouter({
      method: request.method ?? "GET",
      path: url.pathname,
      headers: request.headers as Record<string, string | undefined>
    });

    response.writeHead(result.statusCode, result.headers);
    response.end(result.body);
  });

  server.listen(port, () => {
    console.log(`${appName} listening on http://localhost:${port}`);
  });

  return server;
}
