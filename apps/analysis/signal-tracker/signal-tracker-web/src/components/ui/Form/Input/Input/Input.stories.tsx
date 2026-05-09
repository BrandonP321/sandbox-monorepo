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
    <div className="w-80">
      <Input {...args} />
    </div>
  )
};

export const Disabled: Story = {
  render: (args) => (
    <div className="w-80">
      <Input {...args} disabled placeholder="Disabled input" />
    </div>
  )
};

export const Invalid: Story = {
  render: (args) => (
    <div className="w-80">
      <Input {...args} aria-invalid placeholder="Invalid input" />
    </div>
  )
};
