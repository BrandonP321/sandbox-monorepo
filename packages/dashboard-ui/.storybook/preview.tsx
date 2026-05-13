import type { Preview } from "@storybook/react-vite";

import "../src/styles/index.css";
import "./preview.css";

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
  decorators: [
    (Story, context) => (
      <div
        className={
          context.parameters.layout === "fullscreen"
            ? "sb-preview-frame sb-preview-frame--fullscreen"
            : "sb-preview-frame"
        }
      >
        <Story />
      </div>
    )
  ]
};

export default preview;
