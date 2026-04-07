import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowRight, Plus } from "../../../icons";
import { Button } from "./Button";

const meta = {
  title: "Primitives/Button",
  component: Button,
  args: {
    children: "Continue",
    size: "md",
    variant: "primary"
  },
  argTypes: {
    iconLeft: {
      control: false
    },
    iconRight: {
      control: false
    }
  }
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    variant: "secondary"
  }
};

export const WithLeadingIcon: Story = {
  args: {
    iconLeft: Plus
  }
};

export const WithTrailingIcon: Story = {
  args: {
    iconRight: ArrowRight
  }
};

export const FullWidth: Story = {
  args: {
    fullWidth: true
  },
  parameters: {
    layout: "padded"
  }
};
