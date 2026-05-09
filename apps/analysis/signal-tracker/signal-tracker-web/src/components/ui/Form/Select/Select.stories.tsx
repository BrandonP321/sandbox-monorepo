import type { Meta, StoryObj } from "@storybook/react-vite";

import { Select } from "./Select";

const selectOptions = [
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Archived", value: "archived" }
] as const;

const meta = {
  title: "UI/Form/Select",
  component: Select,
  args: {
    options: [...selectOptions],
    placeholder: "Choose status",
    value: ""
  }
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-80">
      <Select {...args} />
    </div>
  )
};

export const Disabled: Story = {
  render: (args) => (
    <div className="w-80">
      <Select {...args} disabled />
    </div>
  )
};

export const Invalid: Story = {
  render: (args) => (
    <div className="w-80">
      <Select {...args} aria-invalid />
    </div>
  )
};
