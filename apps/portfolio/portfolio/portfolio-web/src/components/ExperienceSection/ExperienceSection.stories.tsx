import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExperienceSection } from "./ExperienceSection";

const meta = {
  title: "Components/ExperienceSection",
  component: ExperienceSection,
  decorators: [
    (Story) => (
      <div className="portfolio-story-preview portfolio-story-preview--fullscreen">
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof ExperienceSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
