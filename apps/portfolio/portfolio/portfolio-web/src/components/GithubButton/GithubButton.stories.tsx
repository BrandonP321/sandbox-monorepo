import type { Meta, StoryObj } from "@storybook/react-vite";

import { GithubButton } from "./GithubButton";

const meta = {
  component: GithubButton,
  parameters: {
    layout: "centered"
  },
  title: "Components/GithubButton"
} satisfies Meta<typeof GithubButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary = {} satisfies Story;

export const Secondary = {
  args: {
    variant: "secondary"
  }
} satisfies Story;
