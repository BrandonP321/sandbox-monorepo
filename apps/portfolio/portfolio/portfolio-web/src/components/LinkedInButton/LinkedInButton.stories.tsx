import type { Meta, StoryObj } from "@storybook/react-vite";

import { LinkedInButton } from "./LinkedInButton";

const meta = {
  component: LinkedInButton,
  parameters: {
    layout: "centered"
  },
  title: "Components/LinkedInButton"
} satisfies Meta<typeof LinkedInButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary = {} satisfies Story;

export const Secondary = {
  args: {
    variant: "secondary"
  }
} satisfies Story;
