import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight, Plus } from "lucide-react";

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

export const Danger: Story = {
  args: {
    children: "Delete topic",
    variant: "danger"
  }
};

export const WithIcons: Story = {
  args: {
    children: "Add entry",
    iconLeft: <Plus aria-hidden="true" className="size-4" />,
    iconRight: <ArrowRight aria-hidden="true" className="size-4" />
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
