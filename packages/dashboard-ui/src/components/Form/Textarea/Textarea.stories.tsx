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
    <div className="w-full max-w-md">
      <Textarea {...args} />
    </div>
  )
};

export const Disabled: Story = {
  render: (args) => (
    <div className="w-full max-w-md">
      <Textarea {...args} disabled placeholder="Disabled textarea" />
    </div>
  )
};

export const Invalid: Story = {
  render: (args) => (
    <div className="w-full max-w-md">
      <Textarea {...args} aria-invalid placeholder="Invalid textarea" />
    </div>
  )
};

export const States: Story = {
  render: (args) => (
    <div className="grid w-full max-w-md gap-3">
      <Textarea {...args} placeholder="Default textarea" />
      <Textarea
        {...args}
        onChange={() => undefined}
        value="A saved note with enough text to show line wrapping."
      />
      <Textarea {...args} disabled placeholder="Disabled textarea" />
      <Textarea {...args} aria-invalid placeholder="Invalid textarea" />
    </div>
  )
};
