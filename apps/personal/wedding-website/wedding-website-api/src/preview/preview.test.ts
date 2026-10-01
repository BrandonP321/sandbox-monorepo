import { describe, expect, it, vi } from "vitest";
import {
  createAdminRsvpApiDependencies,
  sha256Hex
} from "../admin/dependencies.js";
import { createAdminRsvpAppRouter } from "../admin/router.js";
import { createPreviewAdminDependencies } from "./admin-dependencies.js";
import { createPreviewBackend } from "./backend.js";
import { createPreviewFrontend } from "./frontend.js";
import { previewConfig } from "./config.js";
import type { PreviewEvent } from "./http.js";
const now = 2_000_000_000_000;
const config = { createdAt: now - 1000, expiresAt: now + 3600000 };
function event(
  path: string,
  method = "GET",
  extra: Partial<PreviewEvent> = {}
): PreviewEvent {
  return {
    rawPath: path,
    rawQueryString: "",
    headers: {},
    requestContext: {
      accountId: "000000000000",
      apiId: "fake",
      domainName: "fake",
      domainPrefix: "fake",
      http: {
        method,
        path,
        protocol: "HTTP/1.1",
        sourceIp: "127.0.0.1",
        userAgent: "test"
      },
      requestId: "fake",
      routeKey: "$default",
      stage: "$default",
      time: "",
      timeEpoch: now
    },
    ...extra
  };
}

function backend() {
  const listSubmissions = vi.fn().mockResolvedValue([]);
  const router = createAdminRsvpAppRouter(
    createAdminRsvpApiDependencies({
      accessKeySha256: sha256Hex("synthetic-preview-key"),
      repository: { listSubmissions },
      logger: vi.fn()
    })
  );
  return {
    handle: createPreviewBackend(config, router, () => now),
    listSubmissions
  };
}
describe("public preview protected admin API", () => {
  it.each([
    {},
    { authorization: "Bearer arbitrary" },
    { authorization: "Bearer " + "0".repeat(64) }
  ])(
    "unconfigured sentinel disables every admin read before persistence %j",
    async (headers) => {
      const listSubmissions = vi.fn();
      const router = createAdminRsvpAppRouter(
        createAdminRsvpApiDependencies({
          accessKeySha256: "0".repeat(64),
          repository: { listSubmissions },
          logger: vi.fn()
        })
      );
      const response = await createPreviewBackend(
        config,
        router,
        () => now
      )(event("/api/admin/rsvps", "GET", { headers }));
      expect(response.statusCode).toBe(503);
      expect(listSubmissions).not.toHaveBeenCalled();
    }
  );
  it.each([
    {},
    { authorization: "Bearer wrong" },
    { "x-preview-authorization": "old-owner-token" }
  ])(
    "denies data before repository without correct admin key %j",
    (headers) => {
      const test = backend();
      return test
        .handle(event("/api/admin/rsvps", "GET", { headers }))
        .then((response) => {
          expect(response.statusCode).toBe(401);
          expect(test.listSubmissions).not.toHaveBeenCalled();
        });
    }
  );
  it("allows existing admin authorization without owner JWT or cookie and exposes no CORS", async () => {
    const test = backend();
    const response = await test.handle(
      event("/api/admin/rsvps", "GET", {
        headers: { authorization: "Bearer synthetic-preview-key" }
      })
    );
    expect(response.statusCode).toBe(200);
    expect(test.listSubmissions).toHaveBeenCalledOnce();
    expect(response.headers).not.toHaveProperty("access-control-allow-origin");
    expect(response.headers?.["cache-control"]).toBe("no-store");
  });
  it.each(["POST", "PUT", "PATCH", "DELETE", "OPTIONS"])(
    "blocks %s even with admin key",
    async (method) => {
      const test = backend();
      expect(
        (
          await test.handle(
            event("/api/admin/rsvps", method, {
              headers: { authorization: "Bearer synthetic-preview-key" }
            })
          )
        ).statusCode
      ).toBe(405);
      expect(test.listSubmissions).not.toHaveBeenCalled();
    }
  );
  it.each([
    "/api/rsvp",
    "/admin/rsvps",
    "/api/admin/rsvps/",
    "/api/admin/guests"
  ])("rejects other data path %s", async (path) => {
    const test = backend();
    expect((await test.handle(event(path))).statusCode).toBe(405);
    expect(test.listSubmissions).not.toHaveBeenCalled();
  });
  it("rejects queries and inactive windows before data access", async () => {
    const router = vi.fn();
    for (const clock of [config.createdAt - 1, config.expiresAt])
      expect(
        (
          await createPreviewBackend(
            config,
            router,
            () => clock
          )(event("/api/admin/rsvps"))
        ).statusCode
      ).toBe(410);
    expect(
      (
        await backend().handle(
          event("/api/admin/rsvps", "GET", { rawQueryString: "all=true" })
        )
      ).statusCode
    ).toBe(405);
    expect(router).not.toHaveBeenCalled();
  });
  it("withholds data if expiry passes during a read", async () => {
    let clock = now;
    const router = vi.fn(async () => {
      clock = config.expiresAt;
      return { statusCode: 200, headers: {}, body: "sensitive" };
    });
    expect(
      (
        await createPreviewBackend(
          config,
          router,
          () => clock
        )(event("/api/admin/rsvps"))
      ).statusCode
    ).toBe(410);
  });
  it("rejects oversized responses", async () => {
    const router = vi.fn(async () => ({
      statusCode: 200,
      headers: {},
      body: "x".repeat(3000001)
    }));
    expect(
      (
        await createPreviewBackend(
          config,
          router,
          () => now
        )(event("/api/admin/rsvps"))
      ).statusCode
    ).toBe(503);
  });
  it("uses the explicit table with a bounded scan, never returns a partial list", async () => {
    const scan = vi.fn().mockResolvedValue({
      items: [],
      lastEvaluatedKey: { pk: "synthetic-next-page" }
    });
    const deps = createPreviewAdminDependencies(
      { RSVP_TABLE_NAME: "synthetic-existing-table" },
      { scan }
    );
    await expect(deps.repository.listSubmissions()).rejects.toThrow();
    expect(scan).toHaveBeenCalledTimes(10);
    expect(scan).toHaveBeenLastCalledWith(
      expect.objectContaining({
        TableName: "synthetic-existing-table",
        Limit: 200,
        ConsistentRead: false
      })
    );
  });
});
describe("public preview frontend", () => {
  const asset = {
    body: "public HTML",
    contentType: "text/html",
    isBase64Encoded: false
  };
  it.each([
    "/",
    "/faq",
    "/registry",
    "/wedding-day",
    "/RSVP",
    "/admin",
    "/faq/",
    "/assets/example.png"
  ])("serves %s without login/cookies/network", async (path) => {
    const readAsset = vi.fn().mockResolvedValue(asset);
    const result = await createPreviewFrontend(config, {
      readAsset,
      now: () => now
    })(event(path));
    expect(result.statusCode).toBe(200);
    expect(result).not.toHaveProperty("cookies");
    expect(result.headers).not.toHaveProperty("location");
  });
  it.each(["/auth/login", "/auth/callback", "/auth/logout", "/unknown"])(
    "has no auth endpoints: %s",
    async (path) => {
      const readAsset = vi.fn();
      expect(
        (
          await createPreviewFrontend(config, { readAsset, now: () => now })(
            event(path)
          )
        ).statusCode
      ).toBe(404);
      expect(readAsset).not.toHaveBeenCalled();
    }
  );
  it("blocks mutation/data routes before assets", async () => {
    const readAsset = vi.fn();
    const handle = createPreviewFrontend(config, { readAsset, now: () => now });
    expect((await handle(event("/RSVP", "POST"))).statusCode).toBe(405);
    expect((await handle(event("/api/admin/rsvps"))).statusCode).toBe(405);
    expect(readAsset).not.toHaveBeenCalled();
  });
  it("checks expiry before and after asset reads", async () => {
    let clock = config.createdAt - 1;
    const readAsset = vi.fn(async () => {
      clock = config.expiresAt;
      return asset;
    });
    const handle = createPreviewFrontend(config, {
      readAsset,
      now: () => clock
    });
    expect((await handle(event("/"))).statusCode).toBe(410);
    expect(readAsset).not.toHaveBeenCalled();
    clock = now;
    expect((await handle(event("/"))).statusCode).toBe(410);
  });
  it("requires valid <=24h lifetime but no owner settings", () => {
    expect(
      previewConfig({
        PREVIEW_CREATED_AT: new Date(config.createdAt).toISOString(),
        PREVIEW_EXPIRES_AT: new Date(config.expiresAt).toISOString()
      })
    ).toEqual(config);
    expect(() => previewConfig({})).toThrow();
    expect(() =>
      previewConfig({
        PREVIEW_CREATED_AT: new Date(now).toISOString(),
        PREVIEW_EXPIRES_AT: new Date(now + 86400001).toISOString()
      })
    ).toThrow();
  });
});
