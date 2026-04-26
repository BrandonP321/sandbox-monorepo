#!/usr/bin/env node
import { discoverRequestConfigs } from "./discover-request-configs.js";
import { findRepoRoot, toPosixRelative } from "./fs-utils.js";
import { generateArtifacts, writeGeneratedArtifacts } from "./generate.js";
import { loadLocalEnv } from "./load-env.js";
import { getCollectionPath } from "./paths.js";
import { resolveProjects } from "./discover-projects.js";
import { runProjectWithNewman } from "./run-newman.js";
import { syncProjectToPostman } from "./sync.js";
import { validateGeneratedArtifacts } from "./validate-generated.js";

type CliOptions = {
  all: boolean;
  environmentKey?: string;
  projectSlug?: string;
};

async function main(): Promise<void> {
  const [command, ...rawOptions] = process.argv.slice(2);
  const options = parseOptions(rawOptions);
  const repoRoot = findRepoRoot();
  loadLocalEnv(repoRoot);

  if (!command) {
    throw new Error("Usage: postman-sync <generate|validate|sync|run>");
  }

  const projects = await resolveProjects({
    all: options.all,
    projectSlug: options.projectSlug,
    repoRoot
  });

  for (const project of projects) {
    const requests = await discoverRequestConfigs(project);
    const artifacts = generateArtifacts(project, requests);

    switch (command) {
      case "generate":
        validateGeneratedArtifacts(project, requests, artifacts, {
          repoRoot
        });
        writeGeneratedArtifacts(project, artifacts);
        console.log(
          `Generated ${toPosixRelative(repoRoot, getCollectionPath(project))}`
        );
        break;
      case "validate":
        validateGeneratedArtifacts(project, requests, artifacts, {
          checkStaleFiles: true,
          repoRoot
        });
        console.log(`Validated ${project.config.projectSlug}`);
        break;
      case "sync": {
        const apiKey = process.env.POSTMAN_API_KEY;
        if (!apiKey) {
          throw new Error(
            "POSTMAN_API_KEY is required for postman:sync. Set it in your shell or repo-root .env.local."
          );
        }

        validateGeneratedArtifacts(project, requests, artifacts, {
          repoRoot
        });
        writeGeneratedArtifacts(project, artifacts);
        await syncProjectToPostman(project, artifacts, apiKey);
        console.log(`Synced ${project.config.projectSlug} to Postman`);
        break;
      }
      case "run":
        validateGeneratedArtifacts(project, requests, artifacts, {
          checkStaleFiles: true,
          repoRoot
        });
        runProjectWithNewman({
          environmentKey: options.environmentKey ?? "local",
          project,
          repoRoot
        });
        break;
      default:
        throw new Error(`Unknown postman-sync command '${command}'.`);
    }
  }
}

function parseOptions(args: string[]): CliOptions {
  const options: CliOptions = { all: false };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];

    if (arg === "--all") {
      options.all = true;
      continue;
    }

    if (arg === "--project" && next) {
      options.projectSlug = next;
      index += 1;
      continue;
    }

    if (arg.startsWith("--project=")) {
      options.projectSlug = arg.slice("--project=".length);
      continue;
    }

    if (arg === "--env" && next) {
      options.environmentKey = next;
      index += 1;
      continue;
    }

    if (arg.startsWith("--env=")) {
      options.environmentKey = arg.slice("--env=".length);
      continue;
    }

    throw new Error(`Unknown option '${arg}'.`);
  }

  if (options.all && options.projectSlug) {
    throw new Error("Use either --all or --project, not both.");
  }

  return options;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
