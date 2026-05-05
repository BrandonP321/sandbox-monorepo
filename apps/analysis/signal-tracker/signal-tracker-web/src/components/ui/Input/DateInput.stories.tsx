import type { Meta, StoryObj } from "@storybook/react-vite";

import { DateInput } from "./DateInput";

const meta = {
  title: "UI/DateInput",
  component: DateInput
} satisfies Meta<typeof DateInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-80">
      <DateInput {...args} />
    </div>
  )
};

export const WithBounds: Story = {
  render: () => (
    <div className="w-80">
      <DateInput max="2026-12-31" min="2026-01-01" />
    </div>
  )
};

export const Disabled: Story = {
  render: (args) => (
    <div className="w-80">
      <DateInput {...args} disabled value="2026-05-05" />
    </div>
  )
};

export const Invalid: Story = {
  render: (args) => (
    <div className="w-80">
      <DateInput {...args} aria-invalid value="2026-05-05" />
    </div>
  )
};
