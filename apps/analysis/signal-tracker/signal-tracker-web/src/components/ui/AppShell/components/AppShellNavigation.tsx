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
    <ul
      className={cn(
        "grid list-none gap-1 p-0",
        nested && "border-border/70 mt-1.5 ml-3 border-l pl-2.5"
      )}
    >
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
  const linkContent = (
    <>
      {route.icon ? (
        <span
          className="shrink-0 text-current [&>svg]:size-4"
          aria-hidden="true"
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
    nested ? "px-2.5 py-1.5 text-[0.8125rem]" : "px-3 py-2 text-sm",
    isActiveRoute
      ? "bg-accent text-accent-foreground before:absolute before:left-1.5 before:top-1/2 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-primary"
      : "text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground",
    !isActiveRoute && isActiveBranch && "bg-muted/70 text-foreground"
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
