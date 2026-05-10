import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "./Input";

const meta = {
  title: "UI/Form/Input",
  component: Input,
  args: {
    placeholder: "Enter text"
  }
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-full max-w-sm">
      <Input {...args} />
    </div>
  )
};

export const Disabled: Story = {
  render: (args) => (
    <div className="w-full max-w-sm">
      <Input {...args} disabled placeholder="Disabled input" />
    </div>
  )
};

export const Invalid: Story = {
  render: (args) => (
    <div className="w-full max-w-sm">
      <Input {...args} aria-invalid placeholder="Invalid input" />
    </div>
  )
};

export const States: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-3">
      <Input placeholder="Default input" />
      <Input onChange={() => undefined} value="Saved value" />
      <Input disabled placeholder="Disabled input" />
      <Input aria-invalid placeholder="Invalid input" />
    </div>
  )
};
