import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight } from "lucide-react";

import { Button } from "@repo/dashboard-ui";
import { ResourceNotFound } from "./ResourceNotFound";

const meta = {
  title: "UI/ResourceNotFound",
  component: ResourceNotFound,
  parameters: {
    layout: "fullscreen"
  },
  args: {
    actions: <Button>Back to topics</Button>
  },
  argTypes: {
    actions: {
      control: false
    }
  },
  decorators: [
    (Story) => (
      <div className="bg-background min-h-screen w-full">
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof ResourceNotFound>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCustomActions: Story = {
  args: {
    actions: (
      <>
        <Button>Back to topics</Button>
        <Button
          iconRight={<ArrowRight aria-hidden="true" className="size-4" />}
          variant="ghost"
        >
          View active topics
        </Button>
      </>
    ),
    description: "The topic you opened no longer exists or the link is stale.",
    title: "Topic not found"
  }
};
