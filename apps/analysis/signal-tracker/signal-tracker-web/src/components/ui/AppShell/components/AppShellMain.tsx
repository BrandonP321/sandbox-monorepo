import type * as React from "react";

import { cn } from "@/lib/utils";

type AppShellMainProps = Pick<
  React.ComponentProps<"main">,
  "children" | "className"
>;

function AppShellMain({ children, className }: AppShellMainProps) {
  return (
    <main
      data-slot="app-shell-main"
      className={cn(
        "min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7",
        className
      )}
    >
      {children}
    </main>
  );
}

export { AppShellMain, type AppShellMainProps };
