import * as PopoverPrimitive from "@radix-ui/react-popover";
import type * as React from "react";

import { cn } from "@repo/dashboard-ui";

type PopoverProps = Pick<
  React.ComponentProps<typeof PopoverPrimitive.Root>,
  "children" | "defaultOpen" | "modal" | "onOpenChange" | "open"
>;

type PopoverTriggerProps = Pick<
  React.ComponentProps<typeof PopoverPrimitive.Trigger>,
  "children"
>;

type PopoverContentProps = Pick<
  React.ComponentProps<typeof PopoverPrimitive.Content>,
  "align" | "children" | "className" | "side" | "sideOffset"
>;

type PopoverCloseProps = Pick<
  React.ComponentProps<typeof PopoverPrimitive.Close>,
  "children"
>;

function Popover(props: PopoverProps) {
  return <PopoverPrimitive.Root {...props} />;
}

function PopoverTrigger({ children }: PopoverTriggerProps) {
  return (
    <PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>
  );
}

function PopoverContent({
  align = "center",
  children,
  className,
  sideOffset = 8,
  ...contentProps
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        className={cn(
          "bg-popover text-popover-foreground border-border/80 z-50 w-72 rounded-xl border p-4 shadow-lg outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        sideOffset={sideOffset}
        {...contentProps}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}

function PopoverClose({ children }: PopoverCloseProps) {
  return <PopoverPrimitive.Close asChild>{children}</PopoverPrimitive.Close>;
}

export {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
  type PopoverCloseProps,
  type PopoverContentProps,
  type PopoverProps,
  type PopoverTriggerProps
};
