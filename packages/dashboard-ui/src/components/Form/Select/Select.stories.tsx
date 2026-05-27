import type { Meta, StoryObj } from "@storybook/react-vite";

import { Select } from "./Select";

const selectOptions = [
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Archived", value: "archived" }
] as const;

const meta = {
  title: "Components/Form/Select",
  component: Select,
  args: {
    options: [...selectOptions],
    placeholder: "Choose status"
  }
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-full max-w-sm">
      <Select {...args} />
    </div>
  )
};

export const Disabled: Story = {
  render: (args) => (
    <div className="w-full max-w-sm">
      <Select {...args} disabled />
    </div>
  )
};

export const Invalid: Story = {
  render: (args) => (
    <div className="w-full max-w-sm">
      <Select {...args} aria-invalid />
    </div>
  )
};

export const States: Story = {
  render: (args) => (
    <div className="grid w-full max-w-sm gap-3">
      <Select {...args} />
      <Select {...args} onChange={() => undefined} value="active" />
      <Select {...args} disabled />
      <Select {...args} aria-invalid />
    </div>
  )
};
