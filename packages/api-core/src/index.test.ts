import { request as httpRequest } from "node:http";
import type { AddressInfo } from "node:net";

import { describe, expect, it, vi } from "vitest";

import {
  AppError,
  createPostRoute,
  createRoute,
  createRouter,
  responses,
  startLocalDevServer
} from "./index";

describe("createRouter", () => {
  it("returns route response when route exists", async () => {
    const route = createRouter([
      createPostRoute("get-hello", () => responses.ok({ message: "ok" }))
    ]);

    const result = await route({ method: "POST", path: "/get-hello" });

    expect(result.statusCode).toBe(200);
    expect(result.body).toContain("ok");
  });

  it("formats AppError using standard error payload", async () => {
    const route = createRouter([
      createPostRoute("get-hello", () => {
        throw new AppError("VALIDATION_ERROR", "Bad", 422);
      })
    ]);

    const result = await route({ method: "POST", path: "/get-hello" });

    expect(result.statusCode).toBe(422);
    expect(result.body).toContain("VALIDATION_ERROR");
  });

  it("logs incoming requests", async () => {
    const logger = vi.fn();
    const route = createRouter(
      [createPostRoute("get-hello", () => responses.ok({ message: "ok" }))],
      logger
    );

    await route({ method: "POST", path: "/get-hello", requestId: "abc" });

    expect(logger).toHaveBeenCalled();
  });

  it("maps route path from filename", () => {
    const route = createPostRoute("get-health.ts", () =>
      responses.ok({ ok: true })
    );

    expect(route.path).toBe("/get-health");
    expect(route.method).toBe("POST");
  });

  it("creates a route from a shared route spec", () => {
    const route = createRoute({ method: "POST", path: "/get-health" }, () =>
      responses.ok({ ok: true })
    );

    expect(route.path).toBe("/get-health");
    expect(route.method).toBe("POST");
  });

  it("forwards request bodies from the local dev server", async () => {
    const server = startLocalDevServer(
      async (request) => responses.ok({ body: request.body }),
      { appName: "Test API", port: 0 }
    );

    try {
      await waitForListening(server);
      const address = server.address() as AddressInfo;
      const requestBody = JSON.stringify({ message: "hello" });

      const response = await post({
        body: requestBody,
        path: "/echo",
        port: address.port
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({ body: requestBody });
    } finally {
      await closeServer(server);
    }
  });
});

function waitForListening(server: ReturnType<typeof startLocalDevServer>) {
  if (server.listening) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    server.once("listening", resolve);
  });
}

function closeServer(server: ReturnType<typeof startLocalDevServer>) {
  return new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function post(options: { body: string; path: string; port: number }) {
  return new Promise<{ body: string; statusCode: number }>(
    (resolve, reject) => {
      const request = httpRequest(
        {
          headers: {
            "content-type": "application/json",
            "content-length": Buffer.byteLength(options.body)
          },
          hostname: "127.0.0.1",
          method: "POST",
          path: options.path,
          port: options.port
        },
        (response) => {
          const chunks: Buffer[] = [];

          response.on("data", (chunk: Buffer | string) => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          });
          response.on("end", () => {
            resolve({
              body: Buffer.concat(chunks).toString("utf8"),
              statusCode: response.statusCode ?? 0
            });
          });
        }
      );

      request.on("error", reject);
      request.end(options.body);
    }
  );
}
