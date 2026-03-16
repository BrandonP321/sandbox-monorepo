import {
  createRoute,
  createRouter,
  type RouteHandler
} from "@repo/api-core";
import {
  helloWorldRouteEntries,
  type HelloWorldRouteName
} from "@repo/hello-world-shared";

import { getHealth } from "../routes/health/get-health";
import { getHello } from "../routes/hello/get-hello";

const routeHandlers = {
  getHello,
  getHealth
} satisfies Record<HelloWorldRouteName, RouteHandler>;

export const appRouter = createRouter(
  helloWorldRouteEntries.map(([routeName, route]) =>
    createRoute(route, routeHandlers[routeName])
  )
);
