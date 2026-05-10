import type * as React from "react";

import { cn } from "@/lib/utils";

type AppShellHeaderProps = Pick<
  React.ComponentProps<"header">,
  "children" | "className"
>;

function AppShellHeader({ children, className }: AppShellHeaderProps) {
  return (
    <header
      data-slot="app-shell-header"
      className={cn(
        "flex h-16 shrink-0 items-center justify-between gap-3 bg-transparent px-4 sm:px-6 lg:px-7",
        className
      )}
    >
      {children}
    </header>
  );
}

export { AppShellHeader, type AppShellHeaderProps };
