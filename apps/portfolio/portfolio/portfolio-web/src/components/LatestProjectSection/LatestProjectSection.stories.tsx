import type { Meta, StoryObj } from "@storybook/react-vite";

import { LatestProjectSection } from "./LatestProjectSection";

const meta = {
  title: "Components/LatestProjectSection",
  component: LatestProjectSection,
  decorators: [
    (Story) => (
      <div className="portfolio-story-preview portfolio-story-preview--fullscreen">
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof LatestProjectSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
