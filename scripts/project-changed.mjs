#!/usr/bin/env node
import { appendFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

function parseArgs(argv) {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      continue;
    }

    const key = arg.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }

    options[key] = value;
    index += 1;
  }

  return options;
}

function runGit(args) {
  const result = spawnSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `git ${args.join(" ")} failed`);
  }

  return result.stdout.trim();
}

function isZeroSha(value) {
  return /^0+$/.test(value);
}

export function determineProjectChange({ changedFiles, projectRoot }) {
  const normalizedRoot = projectRoot.replace(/\/+$/, "");
  const projectPrefix = `${normalizedRoot}/`;

  const matchedFiles = changedFiles.filter(
    (file) => file.startsWith(projectPrefix) || !file.startsWith("apps/")
  );
  const shouldRun = matchedFiles.length > 0;
  const reason = shouldRun
    ? "Project files or shared monorepo files changed."
    : "Only other apps changed under apps/.";

  return { matchedFiles, reason, shouldRun };
}

function listChangedFiles({ base, head }) {
  if (!base || isZeroSha(base)) {
    const output = runGit(["ls-tree", "-r", "--name-only", head]);
    return output ? output.split(/\r?\n/).filter(Boolean) : [];
  }

  const output = runGit(["diff", "--name-only", base, head]);
  return output ? output.split(/\r?\n/).filter(Boolean) : [];
}

function main() {
  const {
    base,
    head,
    "project-root": projectRoot
  } = parseArgs(process.argv.slice(2));

  if (!head || !projectRoot) {
    throw new Error(
      "Usage: node scripts/project-changed.mjs --base <sha> --head <sha> --project-root <path>"
    );
  }

  const changedFiles = listChangedFiles({ base, head });
  const result = determineProjectChange({ changedFiles, projectRoot });

  const payload = {
    ...result,
    base: base || "",
    changedFiles,
    head,
    projectRoot
  };

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      [
        `changed_files=${JSON.stringify(changedFiles)}`,
        `matched_files=${JSON.stringify(result.matchedFiles)}`,
        `reason=${result.reason}`,
        `should_run=${String(result.shouldRun)}`
      ].join("\n") + "\n"
    );
  }

  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
}

main();
