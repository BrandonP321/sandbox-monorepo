import type { Meta, StoryObj } from "@storybook/react-vite";
import { FolderPlus } from "lucide-react";

import { Button } from "../Button";
import { EmptyState } from "./EmptyState";

const meta = {
  title: "Components/EmptyState",
  component: EmptyState,
  args: {
    action: <Button>New topic</Button>,
    description: "Get started by creating a new topic.",
    icon: <FolderPlus className="size-8" strokeWidth={1.75} />,
    title: "No topics"
  },
  argTypes: {
    action: {
      control: false
    },
    icon: {
      control: false
    }
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutAction: Story = {
  args: {
    action: undefined,
    description: "Adjust the search text to return to the topic list.",
    title: "No matching topics"
  }
};
