import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileText } from "lucide-react";

import { Chip } from "./Chip";

const meta = {
  title: "UI/Chip",
  component: Chip,
  args: {
    children: "Agency report"
  }
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = {
  args: {
    iconLeft: <FileText aria-hidden="true" className="size-3.5" />
  }
};

export const Truncated: Story = {
  render: () => (
    <div className="w-52">
      <Chip iconLeft={<FileText aria-hidden="true" className="size-3.5" />}>
        Extremely long source title that should truncate inside the chip
      </Chip>
    </div>
  )
};
