import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import type * as React from "react";

import { cn } from "@repo/dashboard-ui";

type CollapsibleProps = Pick<
  React.ComponentProps<typeof CollapsiblePrimitive.Root>,
  "children" | "defaultOpen" | "disabled" | "onOpenChange" | "open"
>;

type CollapsibleTriggerProps = Pick<
  React.ComponentProps<typeof CollapsiblePrimitive.Trigger>,
  "children"
>;

type CollapsibleContentProps = Pick<
  React.ComponentProps<typeof CollapsiblePrimitive.Content>,
  "children" | "className" | "forceMount"
>;

function Collapsible(props: CollapsibleProps) {
  return <CollapsiblePrimitive.Root {...props} />;
}

function CollapsibleTrigger({ children }: CollapsibleTriggerProps) {
  return (
    <CollapsiblePrimitive.Trigger asChild>
      {children}
    </CollapsiblePrimitive.Trigger>
  );
}

function CollapsibleContent({
  children,
  className,
  ...contentProps
}: CollapsibleContentProps) {
  return (
    <CollapsiblePrimitive.Content
      className={cn(
        "overflow-hidden data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...contentProps}
    >
      {children}
    </CollapsiblePrimitive.Content>
  );
}

export {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  type CollapsibleContentProps,
  type CollapsibleProps,
  type CollapsibleTriggerProps
};
