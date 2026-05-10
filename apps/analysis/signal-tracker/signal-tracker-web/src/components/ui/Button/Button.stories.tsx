import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight, MoreHorizontal, Plus, RefreshCw } from "lucide-react";

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

export const WithIcons: Story = {
  args: {
    children: "Add entry",
    iconLeft: <Plus aria-hidden="true" className="size-4" />,
    iconRight: <ArrowRight aria-hidden="true" className="size-4" />
  }
};

export const Variants: Story = {
  render: () => (
    <div className="grid w-full max-w-md gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="danger">Delete topic</Button>
        <Button disabled>Disabled</Button>
        <Button isLoading loadingLabel="Saving...">
          Save changes
        </Button>
      </div>
    </div>
  )
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

export const IconOnly: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button
        aria-label="Add entry"
        iconLeft={<Plus aria-hidden="true" className="size-4" />}
        size="icon"
      />
      <Button
        aria-label="Refresh"
        iconLeft={<RefreshCw aria-hidden="true" className="size-4" />}
        size="icon"
        variant="outline"
      />
      <Button
        aria-label="More actions"
        iconLeft={<MoreHorizontal aria-hidden="true" className="size-4" />}
        size="icon"
        variant="ghost"
      />
    </div>
  )
};
