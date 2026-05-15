import type { Meta, StoryObj } from "@storybook/react-vite";

import { GlassButton } from "./GlassButton";

const meta = {
  title: "Components/GlassButton",
  component: GlassButton,
  args: {
    children: "View work",
    icon: <span>+</span>,
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
} satisfies Meta<typeof GlassButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    children: "Read notes",
    variant: "secondary"
  }
};

export const Large: Story = {
  args: {
    children: "Contact me",
    size: "large"
  }
};

export const TextOnlyPair: Story = {
  render: () => (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        flexWrap: "wrap",
        gap: "1.25rem"
      }}
    >
      <GlassButton>Start for free</GlassButton>
      <GlassButton variant="secondary">Request a demo</GlassButton>
    </div>
  )
};

export const Disabled: Story = {
  args: {
    children: "Unavailable",
    disabled: true
  }
};
