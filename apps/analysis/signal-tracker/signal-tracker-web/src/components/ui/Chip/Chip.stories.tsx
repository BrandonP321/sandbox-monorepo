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

export const MetadataRow: Story = {
  render: () => (
    <div className="flex w-full max-w-md flex-wrap items-center gap-2">
      <Chip iconLeft={<FileText aria-hidden="true" className="size-3.5" />}>
        Agency report
      </Chip>
      <Chip>Updated today</Chip>
      <Chip>Reviewed</Chip>
      <div className="max-w-48">
        <Chip title="A longer metadata label">
          A longer metadata label that truncates
        </Chip>
      </div>
    </div>
  )
};
