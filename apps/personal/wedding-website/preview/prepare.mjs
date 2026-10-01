import { createHash } from "node:crypto";
import process from "node:process";
import console from "node:console";
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

// Local build only: no installation, AWS CLI, SDK clients, synth lookup or upload.
const project = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repo = resolve(project, "../../..");
const output = process.argv[2];
if (!output || !output.startsWith("/tmp/"))
  throw new Error("Supply a NEW absolute /tmp/ output directory");
mkdirSync(output); // Never overwrite another preview's build.
for (const name of ["frontend", "backend"]) mkdirSync(join(output, name));
execFileSync(
  "pnpm",
  [
    "exec",
    "vite",
    "build",
    "--config",
    "vite.preview.config.ts",
    "--outDir",
    join(output, "frontend/web")
  ],
  { cwd: join(project, "wedding-website-web"), stdio: "inherit" }
);
for (const name of ["frontend", "backend"]) {
  execFileSync(
    join(repo, "node_modules/.bin/esbuild"),
    [
      join(project, `wedding-website-api/src/preview/${name}-lambda.ts`),
      "--bundle",
      "--platform=node",
      "--target=node24",
      "--format=cjs",
      `--outfile=${join(output, name, "index.js")}`
    ],
    { cwd: repo, stdio: "inherit" }
  );
}
const manifest = {};
let total = 0;
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else {
      const bytes = readFileSync(path);
      if (path.includes("/web/") && bytes.length > 3_000_000)
        throw new Error("Asset exceeds preview response budget");
      total += bytes.length;
      manifest[path.slice(output.length + 1)] = {
        bytes: bytes.length,
        sha256: createHash("sha256").update(bytes).digest("hex")
      };
    }
  }
}
walk(output);
if (total > 150_000_000)
  throw new Error("Preview exceeds uncompressed bundle budget");
writeFileSync(
  join(output, "manifest.json"),
  JSON.stringify(
    {
      sourceRevision: execFileSync("git", ["rev-parse", "HEAD"], {
        cwd: repo,
        encoding: "utf8"
      }).trim(),
      includesLocalDiff: true,
      totalBytes: total,
      files: manifest
    },
    null,
    2
  )
);
console.log(`Prepared local artifacts: ${output}`);
