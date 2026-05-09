import type { Meta, StoryObj } from "@storybook/react-vite";

import { Textarea } from "./Textarea";

const meta = {
  title: "UI/Form/Textarea",
  component: Textarea,
  args: {
    placeholder: "Enter longer text"
  }
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-96">
      <Textarea {...args} />
    </div>
  )
};

export const Disabled: Story = {
  render: (args) => (
    <div className="w-96">
      <Textarea {...args} disabled placeholder="Disabled textarea" />
    </div>
  )
};

export const Invalid: Story = {
  render: (args) => (
    <div className="w-96">
      <Textarea {...args} aria-invalid placeholder="Invalid textarea" />
    </div>
  )
};
