import assert from "node:assert/strict";
import process from "node:process";
import console from "node:console";
import { Buffer } from "node:buffer";
import { createRequire } from "node:module";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
const artifact = process.argv[2];
if (!artifact?.startsWith("/tmp/"))
  throw new Error("Supply prepared /tmp/ artifact directory");
Object.assign(process.env, {
  PREVIEW_CREATED_AT: new Date(Date.now() - 1000).toISOString(),
  PREVIEW_EXPIRES_AT: new Date(Date.now() + 3600000).toISOString(),
  LAMBDA_TASK_ROOT: resolve(artifact, "frontend")
});
globalThis.fetch = async () => {
  throw new Error("Frontend must not make network requests");
};
const { handler } = createRequire(import.meta.url)(
  resolve(artifact, "frontend/index.js")
);
const event = (rawPath, method = "GET") => ({
  rawPath,
  rawQueryString: "",
  headers: {},
  requestContext: { requestId: "fake", http: { method } }
});
for (const path of [
  "/",
  "/faq",
  "/registry",
  "/wedding-day",
  "/RSVP",
  "/admin"
]) {
  const response = await handler(event(path));
  assert.equal(response.statusCode, 200, path);
  assert.equal(response.cookies, undefined);
  assert.match(
    Buffer.from(response.body, "base64").toString(),
    /<title>Wedding read-only preview<\/title>/
  );
}
let assets = 0;
for (const name of readdirSync(resolve(artifact, "frontend/web/assets"))) {
  assert.equal((await handler(event(`/assets/${name}`))).statusCode, 200, name);
  if (/\.(js|css)$/.test(name))
    assert.doesNotMatch(
      readFileSync(resolve(artifact, "frontend/web/assets", name), "utf8"),
      /ADMIN_ACCESS_KEY_SHA256|PREVIEW_OWNER_SUB|cognito-idp|\/auth\/login|synthetic-key|wedding-api\.bphillips\.dev/
    );
  assets++;
}
for (const path of [
  "/auth/login",
  "/auth/callback",
  "/auth/logout",
  "/assets/../index.js",
  "/assets/%2e%2e%2findex.js",
  "/assets/app.js.map"
])
  assert.equal((await handler(event(path))).statusCode, 404, path);
assert.equal((await handler(event("/api/rsvp", "POST"))).statusCode, 405);
assert.equal((await handler(event("/api/admin/rsvps"))).statusCode, 405);
console.log(
  `Bundled public smoke passed: 6 routes and ${assets} assets without login; no auth endpoints, traversal, source maps, mutation/data proxy or embedded auth secrets; no network requests.`
);
