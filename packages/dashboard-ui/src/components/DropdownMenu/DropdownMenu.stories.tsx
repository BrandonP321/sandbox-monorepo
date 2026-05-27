import { MoreHorizontal } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "./DropdownMenu";

const meta = {
  title: "Components/DropdownMenu",
  component: DropdownMenu
} satisfies Meta<typeof DropdownMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

function BasicDropdownMenuStory() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline">Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Open</DropdownMenuItem>
        <DropdownMenuItem>Rename</DropdownMenuItem>
        <DropdownMenuItem disabled>Duplicate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="danger">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function GroupedDropdownMenuStory() {
  return (
    <div className="flex min-h-48 items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            aria-label="Open item menu"
            iconLeft={<MoreHorizontal aria-hidden="true" className="size-4" />}
            size="icon"
            variant="ghost"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>Review</DropdownMenuLabel>
          <DropdownMenuItem>Mark ready</DropdownMenuItem>
          <DropdownMenuItem>Request changes</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Manage</DropdownMenuLabel>
          <DropdownMenuItem>Copy link</DropdownMenuItem>
          <DropdownMenuItem variant="danger">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export const Basic: Story = {
  render: () => <BasicDropdownMenuStory />
};

export const Grouped: Story = {
  render: () => <GroupedDropdownMenuStory />
};
