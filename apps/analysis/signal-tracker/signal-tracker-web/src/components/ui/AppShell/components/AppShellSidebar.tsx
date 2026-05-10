import type * as React from "react";

import { cn } from "@/lib/utils";

import { useAppShellContext } from "../hooks";

type AppShellSidebarProps = Pick<
  React.ComponentProps<"aside">,
  "aria-label" | "children" | "className"
>;

function AppShellSidebar({
  children,
  className,
  ...sidebarProps
}: AppShellSidebarProps) {
  const { isSidebarOpen } = useAppShellContext();

  return (
    <aside
      {...sidebarProps}
      data-slot="app-shell-sidebar"
      data-state={isSidebarOpen ? "open" : "closed"}
      hidden={!isSidebarOpen}
      className={cn(
        "border-border/60 bg-card relative z-20 w-64 shrink-0 border-r overflow-y-auto overscroll-y-contain px-4 py-5",
        className
      )}
    >
      {children}
    </aside>
  );
}

export { AppShellSidebar, type AppShellSidebarProps };
