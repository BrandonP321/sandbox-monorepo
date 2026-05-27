import type { Meta, StoryObj } from "@storybook/react-vite";

import { Card, CardContent } from "../../Card";
import { Stack } from "./Stack";

const meta = {
  title: "Components/Layout/Stack",
  component: Stack
} satisfies Meta<typeof Stack>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-[32rem]">
      <Stack>
        <Card>
          <CardContent className="pt-4">First stacked item</CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">Second stacked item</CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">Third stacked item</CardContent>
        </Card>
      </Stack>
    </div>
  )
};

export const Compact: Story = {
  render: () => (
    <div className="w-full max-w-[24rem]">
      <Stack gap="xs">
        <p className="text-sm">Compact line one</p>
        <p className="text-sm">Compact line two</p>
        <p className="text-sm">Compact line three</p>
      </Stack>
    </div>
  )
};
