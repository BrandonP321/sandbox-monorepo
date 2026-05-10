import { useCallback, useMemo, useState } from "react";
import type * as React from "react";
import { Outlet } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

import {
  AppShellContent,
  AppShellHeader,
  AppShellMain,
  AppShellNavigation,
  AppShellSidebar,
  AppShellSidebarToggle
} from "./components";
import { AppShellContext, type AppShellContextValue } from "./context";
import { useResolvedAppShellRoutes } from "./hooks/useResolvedAppShellRoutes";
import type { AnyAppShellRoute } from "./types";

type AppShellNativeProps = Pick<
  React.ComponentProps<"div">,
  "children" | "className"
>;

type AppShellProps = AppShellNativeProps & {
  defaultSidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
  sidebarLabel?: string;
  sidebarOpen?: boolean;
  routes: readonly AnyAppShellRoute[];
};

function AppShell({
  children,
  className,
  defaultSidebarOpen = true,
  onSidebarOpenChange,
  sidebarLabel = "Application navigation",
  sidebarOpen: controlledSidebarOpen,
  routes
}: AppShellProps) {
  const [uncontrolledSidebarOpen, setUncontrolledSidebarOpen] =
    useState(defaultSidebarOpen);
  const isSidebarOpen = controlledSidebarOpen ?? uncontrolledSidebarOpen;
  const { activeRoute, routes: resolvedRoutes } = useResolvedAppShellRoutes({
    routes
  });

  const setSidebarOpen = useCallback(
    (nextSidebarOpen: boolean) => {
      if (controlledSidebarOpen === undefined) {
        setUncontrolledSidebarOpen(nextSidebarOpen);
      }

      onSidebarOpenChange?.(nextSidebarOpen);
    },
    [controlledSidebarOpen, onSidebarOpenChange]
  );

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, [setSidebarOpen]);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, [setSidebarOpen]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(!isSidebarOpen);
  }, [isSidebarOpen, setSidebarOpen]);

  const contextValue = useMemo<AppShellContextValue>(
    () => ({
      closeSidebar,
      isSidebarOpen,
      openSidebar,
      setSidebarOpen,
      toggleSidebar
    }),
    [closeSidebar, isSidebarOpen, openSidebar, setSidebarOpen, toggleSidebar]
  );

  return (
    <AppShellContext.Provider value={contextValue}>
      <div
        data-slot="app-shell"
        className={cn(
          "bg-background text-foreground flex h-screen overflow-hidden supports-[height:100svh]:h-svh",
          className
        )}
      >
        <AppShellSidebar aria-label={sidebarLabel}>
          <AppShellNavigation
            activeRouteId={activeRoute?.id}
            routes={resolvedRoutes}
          />
        </AppShellSidebar>
        <AppShellContent>
          {activeRoute ? (
            <AppShellHeader>
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <AppShellSidebarToggle className="-ml-1" />
                <span className="text-foreground truncate text-sm font-semibold leading-5">
                  {activeRoute.title}
                </span>
              </div>
            </AppShellHeader>
          ) : null}
          <AppShellMain>{children ?? <Outlet />}</AppShellMain>
        </AppShellContent>
      </div>
    </AppShellContext.Provider>
  );
}

export { AppShell, type AppShellProps };
