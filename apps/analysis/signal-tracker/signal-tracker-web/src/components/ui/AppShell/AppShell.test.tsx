import { fireEvent, render, screen } from "@testing-library/react";
import type * as React from "react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider
} from "@tanstack/react-router";
import { describe, expect, it, vi } from "vitest";

import {
  AppShell,
  type AnyAppShellRoute,
  defineAppShellRoute,
  defineAppShellRoutes,
  useAppShellContext
} from "./index";

const routes = defineAppShellRoutes([
  {
    id: "topics",
    path: "/topics",
    title: "Topics"
  },
  {
    id: "settings",
    path: "/settings",
    title: "Settings"
  }
]);

const nestedRoutes = defineAppShellRoutes([
  {
    children: [
      defineAppShellRoute({
        id: "topic-1",
        params: ({ params }) => ({
          topicId: params.topicId,
          topicTitle: params.topicTitle
        }),
        path: "/topics/$topicId/$topicTitle",
        title: ({ params }) => params.topicTitle,
        visibleWhen: "activeBranch"
      })
    ],
    id: "topics",
    path: "/topics",
    title: "Topics"
  }
]);

describe("AppShell", () => {
  it("renders the shell regions together", async () => {
    await renderAppShell({ initialPath: "/topics", routes });

    expect(
      screen.getByRole("complementary", { name: "Workspace navigation" })
    ).toBeInTheDocument();
    expect(screen.getByRole("banner")).toHaveTextContent("Topics");
    expect(screen.getByRole("main")).toHaveTextContent("Main content");
  });

  it("renders route links and marks the active route", async () => {
    await renderAppShell({ initialPath: "/settings", routes });

    expect(screen.getByRole("link", { name: "Topics" })).toHaveAttribute(
      "href",
      "/topics"
    );
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("banner")).toHaveTextContent("Settings");
  });

  it("renders nested route links and uses the active child as the header title", async () => {
    await renderAppShell({
      initialPath: "/topics/topic-1/Iran%20strike%20risk",
      routes: nestedRoutes
    });

    expect(screen.getByRole("link", { name: "Topics" })).not.toHaveAttribute(
      "aria-current"
    );
    expect(
      screen.getByRole("link", { name: "Iran strike risk" })
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("link", { name: "Iran strike risk" })
    ).toHaveAttribute("href", "/topics/topic-1/Iran%20strike%20risk");
    expect(screen.getByRole("banner")).toHaveTextContent("Iran strike risk");
  });

  it("hides active-branch route links until that branch is active", async () => {
    await renderAppShell({
      initialPath: "/topics",
      routes: nestedRoutes
    });

    expect(screen.getByRole("link", { name: "Topics" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(
      screen.queryByRole("link", { name: "Iran strike risk" })
    ).not.toBeInTheDocument();
  });

  it("lets the sidebar toggle open and close navigation", async () => {
    await renderAppShell({ initialPath: "/topics", routes });

    expect(
      screen.getByRole("complementary", { name: "Workspace navigation" })
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Collapse navigation" })
    );

    expect(
      screen.queryByRole("complementary", { name: "Workspace navigation" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Expand navigation" })
    ).toBeInTheDocument();
  });

  it("lets descendants close the sidebar through context", async () => {
    await renderAppShell({
      children: (
        <>
          <CloseSidebarButton />
          Main content
        </>
      ),
      initialPath: "/topics",
      routes
    });

    fireEvent.click(screen.getByRole("button", { name: "Close navigation" }));

    expect(
      screen.queryByRole("complementary", { name: "Workspace navigation" })
    ).not.toBeInTheDocument();
  });

  it("supports controlled sidebar state", async () => {
    const handleSidebarOpenChange = vi.fn();

    await renderAppShell({
      initialPath: "/topics",
      onSidebarOpenChange: handleSidebarOpenChange,
      routes,
      sidebarOpen: false
    });

    fireEvent.click(screen.getByRole("button", { name: "Expand navigation" }));

    expect(handleSidebarOpenChange).toHaveBeenCalledWith(true);
    expect(
      screen.queryByRole("complementary", { name: "Workspace navigation" })
    ).not.toBeInTheDocument();
  });
});

type RenderAppShellOptions = {
  children?: React.ReactNode;
  initialPath: string;
  onSidebarOpenChange?: (open: boolean) => void;
  routes: readonly AnyAppShellRoute[];
  sidebarOpen?: boolean;
};

async function renderAppShell({
  children = "Main content",
  initialPath,
  onSidebarOpenChange,
  routes,
  sidebarOpen
}: RenderAppShellOptions) {
  const rootRoute = createRootRoute({
    component: () => (
      <AppShell
        onSidebarOpenChange={onSidebarOpenChange}
        routes={routes}
        sidebarLabel="Workspace navigation"
        sidebarOpen={sidebarOpen}
      >
        {children}
      </AppShell>
    )
  });
  const topicListRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/topics",
    component: EmptyRouteComponent
  });
  const settingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/settings",
    component: EmptyRouteComponent
  });
  const topicDetailsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/topics/$topicId/$topicTitle",
    component: EmptyRouteComponent
  });
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: [initialPath] }),
    routeTree: rootRoute.addChildren([
      topicListRoute,
      settingsRoute,
      topicDetailsRoute
    ])
  });

  const renderResult = render(<RouterProvider router={router} />);
  await screen.findByRole("banner");

  return renderResult;
}

function EmptyRouteComponent() {
  return null;
}

function CloseSidebarButton() {
  const { closeSidebar } = useAppShellContext();

  return (
    <button onClick={closeSidebar} type="button">
      Close navigation
    </button>
  );
}
