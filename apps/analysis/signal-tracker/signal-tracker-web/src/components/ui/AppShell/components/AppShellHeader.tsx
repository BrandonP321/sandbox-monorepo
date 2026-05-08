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
        "border-border bg-background/95 flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 sm:px-6",
        className
      )}
    >
      {children}
    </header>
  );
}

export { AppShellHeader, type AppShellHeaderProps };
