import assert from "node:assert/strict";
import test from "node:test";

import { publishSpaAssets } from "./publish-spa-assets.mjs";

test("publishSpaAssets injects API base URL by default", () => {
  const calls = [];
  const logs = [];

  publishSpaAssets(
    [
      "--stack-name",
      "ExampleStack",
      "--web-filter",
      "example-web",
      "--dist-path",
      "apps/example/example-web/dist"
    ],
    {
      env: { EXISTING: "yes" },
      logger: {
        log: (message) => logs.push(message)
      },
      readStackOutput: (outputName) =>
        ({
          ApiBaseUrl: "https://api.example.com",
          WebBucketName: "example-bucket",
          WebDistributionId: "distribution-id",
          WebUrl: "https://web.example.com"
        })[outputName],
      runner: (command, args, env) => {
        calls.push({ args, command, env });
      }
    }
  );

  assert.equal(calls[0].command, "pnpm");
  assert.deepEqual(calls[0].args, ["--filter", "example-web", "run", "build"]);
  assert.equal(calls[0].env.VITE_API_BASE_URL, "https://api.example.com");
  assert.deepEqual(logs, [
    "Published example-web to https://web.example.com",
    "API URL: https://api.example.com"
  ]);
});

test("publishSpaAssets can publish a static app with no API URL", () => {
  const calls = [];
  const outputNames = [];
  const logs = [];

  publishSpaAssets(
    [
      "--stack-name",
      "PortfolioStack",
      "--web-filter",
      "portfolio-web",
      "--dist-path",
      "apps/portfolio/portfolio/portfolio-web/dist",
      "--skip-api-base-url"
    ],
    {
      env: { EXISTING: "yes" },
      logger: {
        log: (message) => logs.push(message)
      },
      readStackOutput: (outputName) => {
        outputNames.push(outputName);
        return {
          WebBucketName: "portfolio-bucket",
          WebDistributionId: "distribution-id",
          WebUrl: "https://portfolio.example.com"
        }[outputName];
      },
      runner: (command, args, env) => {
        calls.push({ args, command, env });
      }
    }
  );

  assert.deepEqual(outputNames, [
    "WebBucketName",
    "WebDistributionId",
    "WebUrl"
  ]);
  assert.equal(calls[0].command, "pnpm");
  assert.deepEqual(calls[0].args, [
    "--filter",
    "portfolio-web",
    "run",
    "build"
  ]);
  assert.equal(calls[0].env.VITE_API_BASE_URL, undefined);
  assert.deepEqual(logs, [
    "Published portfolio-web to https://portfolio.example.com"
  ]);
});

test("publishSpaAssets can use a custom build script", () => {
  const calls = [];

  publishSpaAssets(
    [
      "--stack-name",
      "DashboardUiStorybookStack",
      "--web-filter",
      "@repo/dashboard-ui",
      "--build-script",
      "build-storybook",
      "--dist-path",
      "packages/dashboard-ui/storybook-static",
      "--skip-api-base-url"
    ],
    {
      env: {},
      logger: { log: () => {} },
      readStackOutput: (outputName) =>
        ({
          WebBucketName: "storybook-bucket",
          WebDistributionId: "distribution-id",
          WebUrl: "https://storybook.example.com"
        })[outputName],
      runner: (command, args, env) => {
        calls.push({ args, command, env });
      }
    }
  );

  assert.equal(calls[0].command, "pnpm");
  assert.deepEqual(calls[0].args, [
    "--filter",
    "@repo/dashboard-ui",
    "run",
    "build-storybook"
  ]);
});
