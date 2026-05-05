import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet
} from "@tanstack/react-router";

import { ListTopicsPage } from "./pages/topic/ListTopicsPage";
import { TopicDetailsPage } from "./pages/topic/TopicDetailsPage";
import { appRoutes } from "./routeRegistry";

const rootRoute = createRootRoute({
  component: () => <Outlet />
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: appRoutes.home.path,
  component: ListTopicsPage
});

const listTopicsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: appRoutes.listTopics.path,
  component: ListTopicsPage
});

const topicDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: appRoutes.topicDetails.path,
  component: TopicDetailsPage
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  listTopicsRoute,
  topicDetailsRoute
]);

export function createSignalTrackerRouter() {
  return createRouter({ routeTree });
}

type SignalTrackerRouter = ReturnType<typeof createSignalTrackerRouter>;

declare module "@tanstack/react-router" {
  interface Register {
    router: SignalTrackerRouter;
  }
}
