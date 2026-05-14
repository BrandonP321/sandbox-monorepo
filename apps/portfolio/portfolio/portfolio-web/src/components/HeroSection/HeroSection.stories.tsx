import type { Meta, StoryObj } from "@storybook/react-vite";

import { HeroSection } from "./HeroSection";

const meta = {
  title: "Components/HeroSection",
  component: HeroSection,
  args: {
    description:
      "Building analysis tools, policy workflows, and pragmatic product systems.",
    title: "Brandon Phillips"
  },
  parameters: {
    portfolioPreview: "fullscreen"
  }
} satisfies Meta<typeof HeroSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
