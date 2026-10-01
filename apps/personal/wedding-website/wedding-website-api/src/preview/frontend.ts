import { previewActive, type PreviewConfig } from "./config.js";
import {
  responseHeaders,
  reply,
  type PreviewEvent,
  type PreviewResponse
} from "./http.js";
export type Asset = {
  body: string;
  contentType: string;
  isBase64Encoded: boolean;
};
const pages = new Set([
  "/",
  "/wedding-day",
  "/faq",
  "/registry",
  "/RSVP",
  "/admin"
]);
export function createPreviewFrontend(
  config: PreviewConfig,
  dependencies: {
    readAsset: (path: string) => Promise<Asset | undefined>;
    now?: () => number;
  }
) {
  const now = dependencies.now ?? Date.now;
  return async (event: PreviewEvent): Promise<PreviewResponse> => {
    if (!previewActive(config, now())) return reply(410, "Preview inactive");
    if (
      event.requestContext.http.method !== "GET" ||
      event.rawPath.startsWith("/api/")
    )
      return reply(405, "Read-only preview");
    const path = event.rawPath === "/" ? "/" : event.rawPath.replace(/\/$/, "");
    if (
      event.rawQueryString ||
      (!pages.has(path) && !path.startsWith("/assets/"))
    )
      return reply(404, "Not found");
    const asset = await dependencies.readAsset(
      pages.has(path) ? "/preview.html" : path
    );
    if (!previewActive(config, now())) return reply(410, "Preview inactive");
    if (!asset) return reply(404, "Not found");
    return {
      statusCode: 200,
      headers: { ...responseHeaders, "content-type": asset.contentType },
      body: asset.body,
      isBase64Encoded: asset.isBase64Encoded
    };
  };
}
