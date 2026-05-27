import type { Meta, StoryObj } from "@storybook/react-vite";

import { NumberInput } from "./NumberInput";

const meta = {
  title: "Components/Form/NumberInput",
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
    <div className="w-full max-w-sm">
      <NumberInput {...args} />
    </div>
  )
};

export const Disabled: Story = {
  render: (args) => (
    <div className="w-full max-w-sm">
      <NumberInput {...args} disabled placeholder="Disabled number input" />
    </div>
  )
};

export const Invalid: Story = {
  render: (args) => (
    <div className="w-full max-w-sm">
      <NumberInput {...args} aria-invalid placeholder="Invalid number input" />
    </div>
  )
};

export const MinimumOnly: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <NumberInput min={0} />
    </div>
  )
};

export const MaximumOnly: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <NumberInput max={100} />
    </div>
  )
};

export const States: Story = {
  render: (args) => (
    <div className="grid w-full max-w-sm gap-3">
      <NumberInput {...args} />
      <NumberInput {...args} onChange={() => undefined} value={35} />
      <NumberInput {...args} disabled placeholder="Disabled number input" />
      <NumberInput {...args} aria-invalid placeholder="Invalid number input" />
    </div>
  )
};
