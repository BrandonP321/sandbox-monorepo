import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@repo/dashboard-ui";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger
} from "./Popover";

const meta = {
  title: "UI/Popover",
  component: Popover
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

function BasicPopoverStory() {
  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="outline">Open details</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="grid gap-3">
          <div className="grid gap-1">
            <h3 className="text-sm font-medium">Entry details</h3>
            <p className="text-sm text-muted-foreground">
              Status, confidence, and source notes can sit near the related
              control without taking over the page.
            </p>
          </div>
          <PopoverClose>
            <Button variant="secondary">Done</Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function PositionedPopoverStory() {
  return (
    <div className="flex min-h-56 items-center justify-center">
      <Popover>
        <PopoverTrigger>
          <Button>Review status</Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64" side="top">
          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium">Status</span>
              <span className="text-muted-foreground">Ready</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium">Updated</span>
              <span className="text-muted-foreground">Today</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export const Basic: Story = {
  render: () => <BasicPopoverStory />
};

export const Positioned: Story = {
  render: () => <PositionedPopoverStory />
};
