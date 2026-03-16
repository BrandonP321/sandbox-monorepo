import type { Preview } from "@storybook/react-vite";

import "../src/styles/index.scss";
import "./preview.scss";

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    a11y: {
      disable: false
    },
    controls: {
      expanded: true
    }
  },
  globalTypes: {
    theme: {
      description: "Storybook preview token mode",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        dynamicTitle: true,
        items: [
          { value: "default", title: "Default" },
          { value: "contrast", title: "Contrast" }
        ]
      }
    }
  },
  initialGlobals: {
    theme: "default"
  },
  decorators: [
    (Story, context) => (
      <div
        className="sb-preview-frame"
        data-theme={context.globals.theme ?? "default"}
      >
        <Story />
      </div>
    )
  ]
};

export default preview;
