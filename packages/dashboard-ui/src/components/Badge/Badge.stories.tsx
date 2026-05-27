import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "./Badge";

const meta = {
  title: "Components/Badge",
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

export const Danger: Story = {
  args: {
    children: "Danger",
    variant: "danger"
  }
};

export const Info: Story = {
  args: {
    children: "Info",
    variant: "info"
  }
};

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline"
  }
};

export const Success: Story = {
  args: {
    children: "Success",
    variant: "success"
  }
};

export const Warning: Story = {
  args: {
    children: "Warning",
    variant: "warning"
  }
};

export const Variants: Story = {
  render: () => (
    <div className="flex w-full max-w-md flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  )
};
