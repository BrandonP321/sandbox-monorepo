import { defineConfig } from "vitest/config";
import { baseConfig } from "@repo/config-test";

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    environment: "node"
  }
});
