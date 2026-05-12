import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

import { useAppShellContext } from "../hooks";
import type { AppShellResolvedRoute } from "../types";

type AppShellNavigationProps = {
  activeRouteId: string | undefined;
  routes: readonly AppShellResolvedRoute[];
};

function AppShellNavigation({
  activeRouteId,
  routes
}: AppShellNavigationProps) {
  return (
    <nav aria-label="Routes" className="grid gap-1">
      <AppShellNavigationList activeRouteId={activeRouteId} routes={routes} />
    </nav>
  );
}

function AppShellNavigationList({
  activeRouteId,
  routes,
  nested = false
}: AppShellNavigationProps & { nested?: boolean }) {
  return (
    <ul className={cn("grid list-none gap-1.5 p-0", nested && "mt-1.5")}>
      {routes.map((route) => (
        <AppShellNavigationItem
          activeRouteId={activeRouteId}
          key={route.id}
          nested={nested}
          route={route}
        />
      ))}
    </ul>
  );
}

function AppShellNavigationItem({
  activeRouteId,
  nested,
  route
}: {
  activeRouteId: string | undefined;
  nested: boolean;
  route: AppShellResolvedRoute;
}) {
  const { closeSidebar, isSidebarOverlay } = useAppShellContext();
  const isActiveRoute = route.id === activeRouteId;
  const isActiveBranch =
    isActiveRoute || hasActiveChildRoute(route, activeRouteId);
  const hasChildren = Boolean(route.children?.length);
  const reservesIconSlot = !nested && (Boolean(route.icon) || hasChildren);
  const linkContent = (
    <>
      {reservesIconSlot ? (
        <span
          aria-hidden="true"
          className={cn(
            "flex size-4 shrink-0 items-center justify-center text-current [&>svg]:size-4",
            isActiveBranch && "text-primary"
          )}
          data-slot="app-shell-navigation-icon"
        >
          {route.icon}
        </span>
      ) : null}
      <span className="truncate leading-5">{route.navLinkTitle}</span>
    </>
  );
  const linkClassName = cn(
    "relative flex min-w-0 items-center gap-2 rounded-lg font-medium outline-none transition-[background-color,color,box-shadow]",
    "focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    nested ? "py-2 pr-3 pl-9 text-sm" : "px-3 py-2 text-sm",
    isActiveRoute
      ? "bg-accent/70 text-accent-foreground"
      : "text-muted-foreground hover:bg-accent/40 hover:text-accent-foreground",
    !isActiveRoute && isActiveBranch && "text-muted-foreground"
  );
  const linkProps = {
    "aria-current": isActiveRoute ? "page" : undefined,
    activeOptions: { exact: true },
    children: linkContent,
    className: linkClassName,
    onClick: isSidebarOverlay ? closeSidebar : undefined,
    params: route.params,
    preload: "intent",
    to: route.to
  } as const;

  return (
    <li>
      <Link {...linkProps} />
      {route.children && route.children.length > 0 ? (
        <AppShellNavigationList
          activeRouteId={activeRouteId}
          nested
          routes={route.children}
        />
      ) : null}
    </li>
  );
}

function hasActiveChildRoute(
  route: AppShellResolvedRoute,
  activeRouteId: string | undefined
): boolean {
  if (!activeRouteId) {
    return false;
  }

  return (route.children ?? []).some(
    (childRoute) =>
      childRoute.id === activeRouteId ||
      hasActiveChildRoute(childRoute, activeRouteId)
  );
}

export { AppShellNavigation, type AppShellNavigationProps };
