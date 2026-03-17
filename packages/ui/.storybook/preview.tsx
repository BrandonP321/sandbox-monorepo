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
  decorators: [
    (Story) => (
      <div className="sb-preview-frame">
        <Story />
      </div>
    )
  ]
};

export default preview;
