import type * as React from "react";

import { cn } from "@/lib/utils";

type AppShellContentProps = Pick<
  React.ComponentProps<"div">,
  "children" | "className"
>;

function AppShellContent({ children, className }: AppShellContentProps) {
  return (
    <div
      data-slot="app-shell-content"
      className={cn("flex min-h-0 min-w-0 flex-1 flex-col", className)}
    >
      {children}
    </div>
  );
}

export { AppShellContent, type AppShellContentProps };
