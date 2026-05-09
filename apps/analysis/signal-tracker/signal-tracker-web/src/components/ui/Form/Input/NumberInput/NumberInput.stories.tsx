import type { Meta, StoryObj } from "@storybook/react-vite";

import { NumberInput } from "./NumberInput";

const meta = {
  title: "UI/Form/NumberInput",
  component: NumberInput,
  args: {
    max: 100,
    min: 0,
    step: 1
  }
} satisfies Meta<typeof NumberInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-80">
      <NumberInput {...args} />
    </div>
  )
};

export const Disabled: Story = {
  render: (args) => (
    <div className="w-80">
      <NumberInput {...args} disabled placeholder="Disabled number input" />
    </div>
  )
};

export const Invalid: Story = {
  render: (args) => (
    <div className="w-80">
      <NumberInput {...args} aria-invalid placeholder="Invalid number input" />
    </div>
  )
};

export const MinimumOnly: Story = {
  render: () => (
    <div className="w-80">
      <NumberInput min={0} />
    </div>
  )
};

export const MaximumOnly: Story = {
  render: () => (
    <div className="w-80">
      <NumberInput max={100} />
    </div>
  )
};
