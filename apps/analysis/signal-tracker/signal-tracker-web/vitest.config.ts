import path from "node:path";
import { defineConfig } from "vitest/config";
import { baseConfig } from "@repo/config-test";

export default defineConfig({
  ...baseConfig,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  test: {
    ...baseConfig.test,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts"
  }
});
