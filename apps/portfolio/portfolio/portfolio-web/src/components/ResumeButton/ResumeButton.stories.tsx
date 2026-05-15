import type { Meta, StoryObj } from "@storybook/react-vite";

import { ResumeButton } from "./ResumeButton";

const meta = {
  component: ResumeButton,
  parameters: {
    layout: "centered"
  },
  title: "Components/ResumeButton"
} satisfies Meta<typeof ResumeButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary = {} satisfies Story;

export const Secondary = {
  args: {
    variant: "secondary"
  }
} satisfies Story;
