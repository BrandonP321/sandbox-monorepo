import type * as React from "react";

import { cn } from "../../../lib/utils";

type AppShellHeaderProps = Pick<
  React.ComponentProps<"header">,
  "children" | "className"
> & {
  scrolled?: boolean;
};

function AppShellHeader({
  children,
  className,
  scrolled = false
}: AppShellHeaderProps) {
  return (
    <header
      data-slot="app-shell-header"
      className={cn(
        "relative z-10 flex h-16 shrink-0 items-center justify-between gap-3 px-4 transition-[background-color,box-shadow] duration-300 ease-out sm:px-6 lg:px-7",
        scrolled ? "bg-card shadow-sm" : "bg-transparent shadow-none",
        className
      )}
    >
      {children}
    </header>
  );
}

export { AppShellHeader, type AppShellHeaderProps };
