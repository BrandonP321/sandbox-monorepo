import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { previewConfig } from "./config.js";
import { createPreviewFrontend } from "./frontend.js";

const config = previewConfig(process.env);
const root = resolve(process.env.LAMBDA_TASK_ROOT ?? ".", "web");
const types: Record<string, string> = {
  html: "text/html; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  css: "text/css; charset=utf-8",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
  webp: "image/webp",
  avif: "image/avif",
  woff: "font/woff",
  woff2: "font/woff2"
};
export const handler = createPreviewFrontend(config, {
  async readAsset(path) {
    // Only literal safe asset names; no decoding, traversal, dotfiles, or source maps.
    if (
      path !== "/preview.html" &&
      !/^\/assets\/[A-Za-z0-9_-]+\.(js|css|png|jpg|jpeg|svg|woff|woff2|webp|avif)$/.test(
        path
      )
    )
      return undefined;
    try {
      const bytes = await readFile(resolve(root, `.${path}`));
      if (bytes.length > 3_000_000) return undefined;
      return {
        body: bytes.toString("base64"),
        contentType:
          types[path.split(".").pop() ?? ""] ?? "application/octet-stream",
        isBase64Encoded: true
      };
    } catch {
      return undefined;
    }
  }
});
