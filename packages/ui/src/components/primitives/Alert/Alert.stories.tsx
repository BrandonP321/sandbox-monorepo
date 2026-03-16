import type { Meta, StoryObj } from "@storybook/react-vite";

import { Bell } from "../../../icons";
import { Alert } from "./Alert";

const meta = {
  title: "Primitives/Alert",
  component: Alert,
  args: {
    tone: "info",
    title: "Usage note",
    children:
      "Changes here apply to every report generated from this workspace."
  },
  argTypes: {
    icon: {
      control: false
    }
  }
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Info: Story = {};

export const Success: Story = {
  args: {
    tone: "success",
    title: "Saved",
    children:
      "Your filters were saved and will be reused the next time you visit."
  }
};

export const Warning: Story = {
  args: {
    tone: "warning",
    title: "Partial coverage",
    children:
      "Some counties are still missing filings from the most recent quarter."
  }
};

export const Danger: Story = {
  args: {
    tone: "danger",
    title: "Action required",
    children:
      "The configured API key is invalid and background sync has stopped."
  }
};

export const NoIcon: Story = {
  args: {
    icon: false
  }
};

export const CustomIcon: Story = {
  args: {
    icon: Bell
  }
};
