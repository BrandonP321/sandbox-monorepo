import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./Button";

const meta = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "Save topic"
  },
  argTypes: {
    onClick: {
      control: false
    }
  }
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = {
  args: {
    children: "View details",
    variant: "secondary"
  }
};

export const Destructive: Story = {
  args: {
    children: "Delete topic",
    variant: "destructive"
  }
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Small</Button>
      <Button>Default</Button>
      <Button size="lg">Large</Button>
    </div>
  )
};
