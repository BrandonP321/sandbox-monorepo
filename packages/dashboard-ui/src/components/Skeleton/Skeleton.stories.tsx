import type { Meta, StoryObj } from "@storybook/react-vite";

import { Skeleton } from "./Skeleton";

const meta = {
  title: "Components/Skeleton",
  component: Skeleton
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Line: Story = {
  args: {
    className: "h-4 w-48"
  }
};

export const Block: Story = {
  args: {
    className: "h-24 w-80"
  }
};

export const Stack: Story = {
  render: () => (
    <div className="grid w-80 gap-3">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  )
};
