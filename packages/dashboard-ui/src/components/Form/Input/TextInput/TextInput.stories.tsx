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
    <div className="w-full max-w-sm">
      <TextInput {...args} />
    </div>
  )
};

export const Disabled: Story = {
  render: (args) => (
    <div className="w-full max-w-sm">
      <TextInput {...args} disabled placeholder="Disabled text input" />
    </div>
  )
};

export const Invalid: Story = {
  render: (args) => (
    <div className="w-full max-w-sm">
      <TextInput {...args} aria-invalid placeholder="Invalid text input" />
    </div>
  )
};

export const Types: Story = {
  render: (args) => (
    <div className="grid w-full max-w-sm gap-3">
      <TextInput {...args} placeholder="Search topics" type="search" />
      <TextInput {...args} placeholder="Source URL" type="url" />
      <TextInput {...args} placeholder="Contact email" type="email" />
    </div>
  )
};
