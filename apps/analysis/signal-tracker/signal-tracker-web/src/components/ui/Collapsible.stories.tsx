import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./Button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "./Collapsible";

const meta = {
  title: "UI/Collapsible",
  component: Collapsible
} satisfies Meta<typeof Collapsible>;

export default meta;

type Story = StoryObj<typeof meta>;

function BasicCollapsibleStory() {
  return (
    <div className="w-96">
      <Collapsible>
        <CollapsibleTrigger>
          <Button className="w-full justify-between" variant="outline">
            Show details
            <ChevronDown aria-hidden="true" className="size-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
            Collapsible content keeps supporting details nearby without adding a
            modal or a floating layer.
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function ControlledCollapsibleStory() {
  const [open, setOpen] = useState(true);

  return (
    <div className="w-96">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">Review notes</span>
          <CollapsibleTrigger>
            <Button size="sm" variant="secondary">
              {open ? "Hide" : "Show"}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="pt-3">
          <div className="grid gap-2 rounded-md border p-3 text-sm">
            <p>Assumption set updated after source review.</p>
            <p className="text-muted-foreground">
              Use controlled state when nearby controls need to reflect whether
              the section is expanded.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export const Basic: Story = {
  render: () => <BasicCollapsibleStory />
};

export const Controlled: Story = {
  render: () => <ControlledCollapsibleStory />
};
