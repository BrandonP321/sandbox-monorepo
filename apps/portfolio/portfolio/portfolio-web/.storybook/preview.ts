/// <reference types="vite/client" />

import type { Preview } from "@storybook/react-vite";
import { createElement } from "react";

import "../src/index.css";

const preview: Preview = {
  decorators: [
    (Story) =>
      createElement(
        "div",
        { className: "portfolio-story-preview" },
        createElement(Story)
      )
  ],
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "Portfolio dark",
      values: [{ name: "Portfolio dark", value: "#030014" }]
    },
    controls: {
      expanded: true
    }
  }
};

export default preview;
