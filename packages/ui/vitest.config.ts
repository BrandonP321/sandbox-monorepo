import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, mergeConfig } from "vitest/config";
import { baseConfig } from "@repo/config-test";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

import viteConfig from "./vite.config.ts";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default mergeConfig(
  viteConfig,
  defineConfig({
    ...baseConfig,
    test: {
      ...baseConfig.test,
      projects: [
        {
          extends: true,
          test: {
            name: "unit",
            environment: "node",
            include: ["src/**/*.test.ts", "src/**/*.test.tsx"]
          }
        },
        {
          extends: true,
          plugins: [
            storybookTest({ configDir: path.resolve(dirname, ".storybook") })
          ],
          test: {
            name: "storybook",
            setupFiles: ["./.storybook/vitest.setup.ts"],
            browser: {
              enabled: true,
              headless: true,
              provider: "playwright",
              instances: [{ browser: "chromium" }]
            }
          }
        }
      ]
    }
  })
);
