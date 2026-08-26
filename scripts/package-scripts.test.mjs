import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8")
);

test("dev:wedding-website starts the local API and web app together", () => {
  assert.equal(
    packageJson.scripts["predev:wedding-website"],
    "node scripts/check-node-version.mjs"
  );
  assert.equal(
    packageJson.scripts["dev:wedding-website"],
    'concurrently --kill-others-on-fail -n "API,WEB" -c "magenta,cyan" "pnpm --filter wedding-website-api dev" "pnpm --filter wedding-website-web dev"'
  );
});
