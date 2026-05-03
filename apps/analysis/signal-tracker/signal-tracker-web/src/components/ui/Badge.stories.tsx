import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "./Badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  args: {
    children: "Default"
  }
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary"
  }
};

export const Destructive: Story = {
  args: {
    children: "Destructive",
    variant: "destructive"
  }
};

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline"
  }
};

export const Variants: Story = {
  render: () => (
    <div className="flex w-96 flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  )
};
