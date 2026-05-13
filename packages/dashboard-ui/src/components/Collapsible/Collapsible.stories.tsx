import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../Button";
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
    <div className="w-full max-w-sm">
      <Collapsible>
        <CollapsibleTrigger>
          <Button
            className="w-full justify-between"
            iconRight={<ChevronDown aria-hidden="true" className="size-4" />}
            variant="outline"
          >
            Show details
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <div className="border-border/80 bg-card rounded-lg border p-3 text-sm text-muted-foreground shadow-xs">
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
    <div className="w-full max-w-sm">
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
          <div className="border-border/80 bg-card grid gap-2 rounded-lg border p-3 text-sm shadow-xs">
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
