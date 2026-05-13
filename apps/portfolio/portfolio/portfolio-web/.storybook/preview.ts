/// <reference types="vite/client" />

import type { Preview } from "@storybook/react-vite";

import "../src/index.css";

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: {
      expanded: true
    }
  }
};

export default preview;
