import type { Meta, StoryObj } from "@storybook/react-vite";

import { LoadingState } from "./LoadingState";

const meta = {
  title: "Components/LoadingState",
  component: LoadingState,
  args: {
    label: "Loading"
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof LoadingState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
