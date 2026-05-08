import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type * as React from "react";

import { Button } from "../../Button";
import { useAppShellContext } from "../hooks";

type AppShellSidebarToggleProps = Pick<
  React.ComponentProps<"button">,
  "className"
> & {
  closeLabel?: string;
  openLabel?: string;
};

function AppShellSidebarToggle({
  className,
  closeLabel = "Collapse navigation",
  openLabel = "Expand navigation"
}: AppShellSidebarToggleProps) {
  const { isSidebarOpen, toggleSidebar } = useAppShellContext();
  const label = isSidebarOpen ? closeLabel : openLabel;
  const Icon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;

  return (
    <Button
      aria-label={label}
      className={className}
      onClick={toggleSidebar}
      size="icon"
      variant="ghost"
    >
      <Icon aria-hidden="true" className="size-4" />
    </Button>
  );
}

export { AppShellSidebarToggle, type AppShellSidebarToggleProps };
