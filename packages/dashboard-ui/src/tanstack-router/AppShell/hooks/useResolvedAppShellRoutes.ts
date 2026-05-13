import { useMemo } from "react";
import { useRouterState } from "@tanstack/react-router";

import type {
  AnyAppShellRoute,
  AppShellResolvedRoute,
  AppShellRouteContext,
  AppShellRouteParams
} from "../types";

type UseResolvedAppShellRoutesOptions = {
  routes: readonly AnyAppShellRoute[];
};

function useResolvedAppShellRoutes({
  routes
}: UseResolvedAppShellRoutesOptions) {
  const activeRouterMatch = useRouterState({
    select: (state) => {
      const activeMatch = state.matches.at(-1);

      return {
        activePath: activeMatch?.fullPath,
        params: (activeMatch?.params ?? {}) as AppShellRouteParams
      };
    }
  });
  const routeContext = useMemo<AppShellRouteContext>(
    () => ({
      activePath: activeRouterMatch.activePath,
      params: activeRouterMatch.params
    }),
    [activeRouterMatch]
  );
  const resolvedRoutes = useMemo(
    () => resolveAppShellRoutes(routes, routeContext),
    [routeContext, routes]
  );
  const activeRouteBranch = findActiveAppShellRouteBranch(
    resolvedRoutes,
    activeRouterMatch.activePath
  );
  const activeRoute = activeRouteBranch?.at(-1) ?? resolvedRoutes[0];
  const activeRouteBreadcrumbs =
    activeRouteBranch ?? (activeRoute ? [activeRoute] : []);

  return {
    activeRoute,
    activeRouteBreadcrumbs,
    routes: resolvedRoutes
  };
}

function resolveAppShellRoutes(
  routes: readonly AnyAppShellRoute[],
  context: AppShellRouteContext
): AppShellResolvedRoute[] {
  return routes.flatMap((route) => {
    if (!isVisibleAppShellRoute(route, context)) {
      return [];
    }

    const children = resolveAppShellRoutes(route.children ?? [], context);
    const title = resolveRouteValue(route.title, context);

    return [
      {
        breadcrumbTitle: route.breadcrumbTitle
          ? resolveRouteValue(route.breadcrumbTitle, context)
          : title,
        children: children.length > 0 ? children : undefined,
        description: route.description
          ? resolveRouteValue(route.description, context)
          : undefined,
        icon: route.icon,
        id: route.id ?? route.path,
        navLinkTitle: route.navLinkTitle
          ? resolveRouteValue(route.navLinkTitle, context)
          : title,
        params: route.params
          ? resolveRouteValue(route.params, context)
          : undefined,
        path: route.path,
        title,
        to: resolveRouteValue(route.to ?? route.path, context)
      }
    ];
  });
}

function findActiveAppShellRouteBranch(
  routes: readonly AppShellResolvedRoute[],
  activePath: string | undefined
): AppShellResolvedRoute[] | undefined {
  if (!activePath) {
    return undefined;
  }

  for (const route of routes) {
    if (route.path === activePath) {
      return [route];
    }

    const childRouteBranch = findActiveAppShellRouteBranch(
      route.children ?? [],
      activePath
    );

    if (childRouteBranch) {
      return [route, ...childRouteBranch];
    }
  }

  return undefined;
}

function isVisibleAppShellRoute(
  route: AnyAppShellRoute,
  context: AppShellRouteContext
) {
  if (route.visibleWhen !== "activeBranch") {
    return true;
  }

  return isRouteInActiveBranch(route, context.activePath);
}

function isRouteInActiveBranch(
  route: AnyAppShellRoute,
  activePath: string | undefined
): boolean {
  if (!activePath) {
    return false;
  }

  return (
    route.path === activePath ||
    (route.children ?? []).some((childRoute) =>
      isRouteInActiveBranch(childRoute, activePath)
    )
  );
}

function resolveRouteValue<TValue>(
  value: TValue | ((context: AppShellRouteContext) => TValue),
  context: AppShellRouteContext
) {
  return typeof value === "function"
    ? (value as (context: AppShellRouteContext) => TValue)(context)
    : value;
}

export { useResolvedAppShellRoutes };
