import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

import dashboardUiViteConfig from "../vite.config.ts";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  viteFinal: async (config) => mergeConfig(config, dashboardUiViteConfig)
};

export default config;
