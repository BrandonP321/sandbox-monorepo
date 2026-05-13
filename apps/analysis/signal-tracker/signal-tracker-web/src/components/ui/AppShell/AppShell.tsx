import { useCallback, useEffect, useMemo, useState } from "react";
import type * as React from "react";
import { Outlet } from "@tanstack/react-router";
import { useMinBreakpoint } from "@repo/ui-base";
import { NotificationProvider } from "@repo/ui-base/notifications";

import { cn } from "@repo/dashboard-ui";

import { Breadcrumbs, type BreadcrumbsItem } from "../Breadcrumbs";
import { NotificationFlashbar } from "../Notifications";
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

const HEADER_SCROLLED_OFFSET_PX = 8;

type AppShellNativeProps = Pick<
  React.ComponentProps<"div">,
  "children" | "className"
>;

type AppShellProps = AppShellNativeProps & {
  contentClassName?: string;
  defaultSidebarOpen?: boolean;
  notificationFlashbarClassName?: string;
  onSidebarOpenChange?: (open: boolean) => void;
  sidebarBrand?: React.ReactNode;
  sidebarLabel?: string;
  sidebarOpen?: boolean;
  routes: readonly AnyAppShellRoute[];
};

function AppShell({
  children,
  className,
  contentClassName,
  defaultSidebarOpen,
  notificationFlashbarClassName,
  onSidebarOpenChange,
  sidebarBrand,
  sidebarLabel = "Application navigation",
  sidebarOpen: controlledSidebarOpen,
  routes
}: AppShellProps) {
  const isDesktopSidebar = useMinBreakpoint("md", { ssrMatch: true });
  const usesResponsiveSidebarDefault =
    defaultSidebarOpen === undefined && controlledSidebarOpen === undefined;
  const [uncontrolledSidebarOpen, setUncontrolledSidebarOpen] = useState(
    defaultSidebarOpen ?? isDesktopSidebar
  );
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const isSidebarOpen = controlledSidebarOpen ?? uncontrolledSidebarOpen;
  const isSidebarOverlay = !isDesktopSidebar;
  const {
    activeRoute,
    activeRouteBreadcrumbs,
    routes: resolvedRoutes
  } = useResolvedAppShellRoutes({ routes });
  const breadcrumbItems = useMemo<BreadcrumbsItem[]>(
    () =>
      activeRouteBreadcrumbs.map((route) => ({
        icon: route.icon,
        id: route.id,
        params: route.params,
        title: route.breadcrumbTitle,
        to: route.to
      })),
    [activeRouteBreadcrumbs]
  );

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

  useEffect(() => {
    if (!usesResponsiveSidebarDefault) {
      return;
    }

    setUncontrolledSidebarOpen(isDesktopSidebar);
  }, [isDesktopSidebar, usesResponsiveSidebarDefault]);

  const handleMainScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    setIsHeaderScrolled(
      event.currentTarget.scrollTop > HEADER_SCROLLED_OFFSET_PX
    );
  }, []);

  const contextValue = useMemo<AppShellContextValue>(
    () => ({
      closeSidebar,
      isSidebarOpen,
      isSidebarOverlay,
      openSidebar,
      setSidebarOpen,
      toggleSidebar
    }),
    [
      closeSidebar,
      isSidebarOpen,
      isSidebarOverlay,
      openSidebar,
      setSidebarOpen,
      toggleSidebar
    ]
  );

  return (
    <NotificationProvider mode="multiple">
      <AppShellContext.Provider value={contextValue}>
        <div
          data-slot="app-shell"
          className={cn(
            "bg-background text-foreground flex h-screen overflow-hidden supports-[height:100svh]:h-svh",
            className
          )}
        >
          <AppShellSidebar aria-label={sidebarLabel} brand={sidebarBrand}>
            <AppShellNavigation
              activeRouteId={activeRoute?.id}
              routes={resolvedRoutes}
            />
          </AppShellSidebar>
          <AppShellContent>
            {activeRoute ? (
              <AppShellHeader scrolled={isHeaderScrolled}>
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <AppShellSidebarToggle className="-ml-1" />
                  <Breadcrumbs items={breadcrumbItems} />
                </div>
              </AppShellHeader>
            ) : null}
            <AppShellMain
              className={contentClassName}
              onScroll={handleMainScroll}
            >
              <NotificationFlashbar
                className={cn("mb-4", notificationFlashbarClassName)}
              />
              {children ?? <Outlet />}
            </AppShellMain>
          </AppShellContent>
        </div>
      </AppShellContext.Provider>
    </NotificationProvider>
  );
}

export { AppShell, type AppShellProps };
