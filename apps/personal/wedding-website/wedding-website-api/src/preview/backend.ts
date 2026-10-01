import type { RouteHandler } from "@repo/api-core";
import { previewActive, type PreviewConfig } from "./config.js";
import { header, responseHeaders, reply, type PreviewEvent } from "./http.js";

export function createPreviewBackend(
  config: PreviewConfig,
  adminRouter: RouteHandler,
  now: () => number = Date.now
) {
  return async (event: PreviewEvent) => {
    if (!previewActive(config, now())) return reply(410, "Preview inactive");
    // Business-route allowlist before admin authorization or persistence work.
    if (
      event.requestContext.http.method !== "GET" ||
      event.rawPath !== "/api/admin/rsvps" ||
      event.rawQueryString
    )
      return reply(405, "Read-only preview");
    const response = await adminRouter({
      method: "GET",
      path: "/admin/rsvps",
      headers: { authorization: header(event, "authorization") },
      requestId: event.requestContext.requestId
    });
    if (!previewActive(config, now())) return reply(410, "Preview inactive");
    if (Buffer.byteLength(response.body) > 3_000_000)
      return reply(503, "Preview response exceeds read budget");
    // The production router's permissive CORS defaults are not exposed here.
    return {
      ...response,
      headers: { ...responseHeaders, "content-type": "application/json" }
    };
  };
}
