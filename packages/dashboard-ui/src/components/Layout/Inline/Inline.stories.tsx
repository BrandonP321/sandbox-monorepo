import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "../../Badge";
import { Button } from "../../Button";
import { Inline } from "./Inline";

const meta = {
  title: "Components/Layout/Inline",
  component: Inline
} satisfies Meta<typeof Inline>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ActionRow: Story = {
  render: () => (
    <div className="w-full max-w-[28rem]">
      <Inline justify="end">
        <Button variant="outline">Cancel</Button>
        <Button>Add event</Button>
      </Inline>
    </div>
  )
};

export const WrappedMetadata: Story = {
  render: () => (
    <div className="w-full max-w-[18rem]">
      <Inline>
        <p className="text-muted-foreground text-xs font-medium uppercase">
          Topic workspace
        </p>
        <Badge variant="outline">Archived</Badge>
        <Badge variant="secondary">Manual dossier</Badge>
      </Inline>
    </div>
  )
};
