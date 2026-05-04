import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../Button";
import { Alert } from "./Alert";

const meta = {
  title: "UI/Alert",
  component: Alert,
  argTypes: {
    role: {
      control: false
    }
  }
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    actions: <Button variant="outline">Retry</Button>,
    children: "Retry the request without leaving the page.",
    title: "Topics could not be loaded."
  }
};

export const Danger: Story = {
  args: {
    children: "Resolve the API error before trying again.",
    title: "Topic could not be deleted.",
    variant: "danger"
  }
};
