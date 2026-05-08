import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

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
    <nav aria-label="Routes">
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
        nested && "border-border mt-1 ml-4 border-l pl-2"
      )}
    >
      {routes.map((route) => (
        <AppShellNavigationItem
          activeRouteId={activeRouteId}
          key={route.id}
          route={route}
        />
      ))}
    </ul>
  );
}

function AppShellNavigationItem({
  activeRouteId,
  route
}: {
  activeRouteId: string | undefined;
  route: AppShellResolvedRoute;
}) {
  const isActiveRoute = route.id === activeRouteId;
  const isActiveBranch =
    isActiveRoute || hasActiveChildRoute(route, activeRouteId);
  const linkContent = (
    <>
      {route.icon ? (
        <span className="shrink-0" aria-hidden="true">
          {route.icon}
        </span>
      ) : null}
      <span className="truncate">{route.title}</span>
    </>
  );
  const linkClassName = cn(
    "flex min-w-0 items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors",
    "focus-visible:border-ring focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]",
    isActiveRoute
      ? "bg-accent text-accent-foreground"
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
    !isActiveRoute && isActiveBranch && "text-foreground"
  );
  const linkProps = {
    "aria-current": isActiveRoute ? "page" : undefined,
    activeOptions: { exact: true },
    children: linkContent,
    className: linkClassName,
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
