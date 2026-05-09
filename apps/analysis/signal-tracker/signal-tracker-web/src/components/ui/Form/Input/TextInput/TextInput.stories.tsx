import type { Meta, StoryObj } from "@storybook/react-vite";

import { TextInput } from "./TextInput";

const meta = {
  title: "UI/Form/TextInput",
  component: TextInput,
  args: {
    placeholder: "Enter text"
  }
} satisfies Meta<typeof TextInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-80">
      <TextInput {...args} />
    </div>
  )
};

export const Disabled: Story = {
  render: (args) => (
    <div className="w-80">
      <TextInput {...args} disabled placeholder="Disabled text input" />
    </div>
  )
};

export const Invalid: Story = {
  render: (args) => (
    <div className="w-80">
      <TextInput {...args} aria-invalid placeholder="Invalid text input" />
    </div>
  )
};
