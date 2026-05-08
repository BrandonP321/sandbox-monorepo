import type { AnyAppShellRoute, AppShellRoute } from "./types";

function defineAppShellRoute<const TPath extends string>(
  route: AppShellRoute<TPath>
) {
  return route;
}

function defineAppShellRoutes<
  const TRoutes extends readonly AnyAppShellRoute[]
>(routes: TRoutes) {
  return routes;
}

export { defineAppShellRoute, defineAppShellRoutes };
