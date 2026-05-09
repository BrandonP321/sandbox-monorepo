import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider
} from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { appRoutes } from "@/routeRegistry";

import { PageNotFound } from "./PageNotFound";

describe("PageNotFound", () => {
  it("renders the default page not-found copy and home link", async () => {
    await renderPageNotFound(<PageNotFound />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Page not found" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Sorry, we couldn't find the page you're looking for.")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go back home" })).toHaveAttribute(
      "href",
      "/"
    );
  });

  it("renders custom copy with a standardized home action", async () => {
    await renderPageNotFound(
      <PageNotFound
        description="The page you opened no longer exists."
        homeLabel="View active topics"
        homePath={appRoutes.listTopics.path}
        title="Workspace not found"
      />
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Workspace not found" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("The page you opened no longer exists.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View active topics" })
    ).toHaveAttribute("href", "/topics");
  });

  it("keeps PageNotFound home paths scoped to static routes", () => {
    const invalidDynamicPath = (
      <PageNotFound
        // @ts-expect-error homePath cannot point to a route requiring params.
        homePath={appRoutes.topicDetails.path}
      />
    );

    expect(invalidDynamicPath).toBeTruthy();
  });
});

async function renderPageNotFound(ui: ReactNode) {
  const rootRoute = createRootRoute({
    component: () => ui
  });
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: appRoutes.home.path,
    component: EmptyRouteComponent
  });
  const listTopicsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: appRoutes.listTopics.path,
    component: EmptyRouteComponent
  });
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: [appRoutes.home.path] }),
    routeTree: rootRoute.addChildren([homeRoute, listTopicsRoute])
  });

  const renderResult = render(<RouterProvider router={router} />);
  await screen.findByRole("link");

  return renderResult;
}

function EmptyRouteComponent() {
  return null;
}
