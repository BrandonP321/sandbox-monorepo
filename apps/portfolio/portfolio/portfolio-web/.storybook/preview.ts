/// <reference types="vite/client" />

import type { Preview } from "@storybook/react-vite";
import { createElement } from "react";

import "../src/index.css";

const preview: Preview = {
  decorators: [
    (Story, context) =>
      createElement(
        "div",
        {
          className:
            context.parameters.portfolioPreview === "fullscreen"
              ? "portfolio-story-preview portfolio-story-preview--fullscreen"
              : "portfolio-story-preview"
        },
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
