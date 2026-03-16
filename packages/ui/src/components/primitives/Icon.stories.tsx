import type { Meta, StoryObj } from "@storybook/react-vite";

import { AlertCircle, ArrowRight, Plus } from "../../icons";
import { Icon } from "./Icon";

const meta = {
  title: "Primitives/Icon",
  component: Icon,
  args: {
    icon: Plus,
    size: "md"
  },
  argTypes: {
    icon: {
      control: false
    }
  }
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Directional: Story = {
  args: {
    icon: ArrowRight
  }
};

export const Alert: Story = {
  args: {
    icon: AlertCircle
  }
};

export const Large: Story = {
  args: {
    size: "lg"
  }
};
