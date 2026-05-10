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

export const InfoDefault: Story = {
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

export const Success: Story = {
  args: {
    children: "The topic is available in the active topic list.",
    title: "Topic created.",
    variant: "success"
  }
};

export const Info: Story = {
  args: {
    children: "Evidence can be attached after the topic has been created.",
    title: "Evidence can wait.",
    variant: "info"
  }
};

export const Warning: Story = {
  args: {
    children: "Unsaved edits will be lost if you leave this view.",
    title: "Unsaved changes.",
    variant: "warning"
  }
};

export const AllVariants: Story = {
  args: {
    children: "Variant overview.",
    title: "Alert variants"
  },
  render: () => (
    <div className="grid w-full max-w-xl gap-3">
      <Alert title="Evidence can wait." variant="info">
        Attach evidence after the topic has enough context.
      </Alert>
      <Alert title="Topic created." variant="success">
        The topic is available in the active topic list.
      </Alert>
      <Alert title="Unsaved changes." variant="warning">
        Save or discard edits before leaving this view.
      </Alert>
      <Alert title="Topic could not be deleted." variant="danger">
        Resolve the API error before trying again.
      </Alert>
    </div>
  )
};
