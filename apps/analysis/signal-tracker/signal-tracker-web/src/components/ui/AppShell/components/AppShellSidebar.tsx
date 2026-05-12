import type * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "../../Button";
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
  const { closeSidebar, isSidebarOpen, isSidebarOverlay } =
    useAppShellContext();

  return (
    <aside
      {...sidebarProps}
      aria-hidden={isSidebarOpen ? undefined : true}
      data-slot="app-shell-sidebar"
      data-state={isSidebarOpen ? "open" : "closed"}
      inert={isSidebarOpen ? undefined : true}
      className={cn(
        "border-border/60 bg-card fixed inset-0 z-40 flex h-screen min-h-0 w-full flex-col overflow-hidden px-4 py-5 transition-transform duration-300 ease-out will-change-transform supports-[height:100svh]:h-svh motion-reduce:transition-none md:relative md:z-20 md:h-auto md:w-64 md:shrink-0 md:border-r md:transition-[margin,opacity,transform]",
        isSidebarOpen
          ? "pointer-events-auto translate-x-0 md:ml-0 md:opacity-100"
          : "pointer-events-none -translate-x-full md:-ml-64 md:opacity-0",
        className
      )}
    >
      {isSidebarOverlay ? (
        <div className="mb-4 flex shrink-0 justify-end md:hidden">
          <Button
            aria-label="Close navigation"
            className="text-muted-foreground"
            onClick={closeSidebar}
            size="icon"
            variant="ghost"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>
      ) : null}
      <div
        data-slot="app-shell-sidebar-scroll-area"
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
      >
        {children}
      </div>
    </aside>
  );
}

export { AppShellSidebar, type AppShellSidebarProps };
