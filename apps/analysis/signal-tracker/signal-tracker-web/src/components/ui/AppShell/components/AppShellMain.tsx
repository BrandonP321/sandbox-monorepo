import type * as React from "react";

import { cn } from "@repo/dashboard-ui";

type AppShellMainProps = Pick<
  React.ComponentProps<"main">,
  "children" | "className" | "onScroll"
>;

function AppShellMain({ children, className, onScroll }: AppShellMainProps) {
  return (
    <main
      data-slot="app-shell-main"
      onScroll={onScroll}
      className={cn(
        "min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pt-5 pb-5 sm:px-6 sm:pt-6 sm:pb-6 lg:px-8 lg:pt-7 lg:pb-7",
        className
      )}
    >
      {children}
    </main>
  );
}

export { AppShellMain, type AppShellMainProps };
