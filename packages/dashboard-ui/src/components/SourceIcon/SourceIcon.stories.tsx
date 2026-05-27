import { FileText } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { SourceIcon } from "./SourceIcon";

const meta = {
  title: "Components/SourceIcon",
  component: SourceIcon,
  args: {
    url: "https://agency.example/report"
  }
} satisfies Meta<typeof SourceIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Fallback: Story = {
  args: {
    url: undefined
  }
};

export const CustomFallback: Story = {
  args: {
    defaultIcon: <FileText aria-hidden="true" className="size-full" />,
    url: undefined
  }
};

export const Sizes: Story = {
  render: () => (
    <div className="flex w-48 items-center gap-3">
      <SourceIcon size="sm" url="https://agency.example/report" />
      <SourceIcon size="md" url="https://agency.example/report" />
      <SourceIcon size="lg" url="https://agency.example/report" />
    </div>
  )
};
