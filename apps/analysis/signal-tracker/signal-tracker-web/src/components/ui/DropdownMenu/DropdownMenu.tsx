import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import type * as React from "react";

import { cn } from "@/lib/utils";

type DropdownMenuProps = Pick<
  React.ComponentProps<typeof DropdownMenuPrimitive.Root>,
  "children" | "defaultOpen" | "modal" | "onOpenChange" | "open"
>;

type DropdownMenuTriggerProps = Pick<
  React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>,
  "children"
>;

type DropdownMenuContentProps = Pick<
  React.ComponentProps<typeof DropdownMenuPrimitive.Content>,
  "align" | "children" | "className" | "side" | "sideOffset"
>;

type DropdownMenuItemProps = Pick<
  React.ComponentProps<typeof DropdownMenuPrimitive.Item>,
  "children" | "className" | "disabled" | "onSelect"
> & {
  variant?: "default" | "danger";
};

type DropdownMenuLabelProps = Pick<
  React.ComponentProps<typeof DropdownMenuPrimitive.Label>,
  "children" | "className"
>;

type DropdownMenuSeparatorProps = Pick<
  React.ComponentProps<typeof DropdownMenuPrimitive.Separator>,
  "className"
>;

function DropdownMenu(props: DropdownMenuProps) {
  return <DropdownMenuPrimitive.Root {...props} />;
}

function DropdownMenuTrigger({ children }: DropdownMenuTriggerProps) {
  return (
    <DropdownMenuPrimitive.Trigger asChild>
      {children}
    </DropdownMenuPrimitive.Trigger>
  );
}

function DropdownMenuContent({
  align = "end",
  children,
  className,
  sideOffset = 8,
  ...contentProps
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        align={align}
        className={cn(
          "bg-popover text-popover-foreground z-50 min-w-40 overflow-hidden rounded-md border p-1 shadow-md outline-none",
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
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuItem({
  children,
  className,
  variant = "default",
  ...itemProps
}: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        variant === "danger" &&
          "text-danger focus:bg-danger/10 focus:text-danger",
        className
      )}
      {...itemProps}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  );
}

function DropdownMenuLabel({ children, className }: DropdownMenuLabelProps) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn("px-2 py-1.5 text-xs font-medium", className)}
    >
      {children}
    </DropdownMenuPrimitive.Label>
  );
}

function DropdownMenuSeparator({ className }: DropdownMenuSeparatorProps) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("bg-border -mx-1 my-1 h-px", className)}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  type DropdownMenuContentProps,
  type DropdownMenuItemProps,
  type DropdownMenuLabelProps,
  type DropdownMenuProps,
  type DropdownMenuSeparatorProps,
  type DropdownMenuTriggerProps
};
