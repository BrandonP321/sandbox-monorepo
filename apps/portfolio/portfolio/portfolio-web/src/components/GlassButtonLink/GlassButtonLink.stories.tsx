import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileText } from "lucide-react";

import { GlassButtonLink } from "./GlassButtonLink";

const meta = {
  title: "Components/GlassButtonLink",
  component: GlassButtonLink,
  args: {
    children: "Resume",
    href: "#resume",
    icon: <FileText />,
    size: "default",
    variant: "primary"
  },
  argTypes: {
    icon: {
      control: false
    },
    onClick: {
      control: false
    },
    size: {
      control: "inline-radio",
      options: ["default", "large"]
    },
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary"]
    }
  }
} satisfies Meta<typeof GlassButtonLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    children: "View project",
    href: "#project",
    variant: "secondary"
  }
};

export const Large: Story = {
  args: {
    children: "Contact me",
    href: "#contact",
    size: "large"
  }
};
