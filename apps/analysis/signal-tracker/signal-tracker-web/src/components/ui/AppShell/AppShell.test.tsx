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

    const sidebar = screen.getByRole("complementary", {
      name: "Workspace navigation"
    });

    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveClass(
      "border-r",
      "border-border/60",
      "overflow-y-auto",
      "overscroll-y-contain"
    );
    expect(screen.getByRole("banner")).toHaveTextContent("Topics");
    expect(screen.getByRole("main")).toHaveTextContent("Main content");
  });

  it("pads main content by default and accepts content class overrides", async () => {
    await renderAppShell({
      contentClassName: "pt-0",
      initialPath: "/topics",
      routes
    });

    expect(screen.getByRole("main")).toHaveClass("px-4", "pt-0", "pb-5");
    expect(screen.getByRole("main")).not.toHaveClass("pt-5");
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

  it("applies the scrolled header treatment after main content scrolls past the threshold", async () => {
    await renderAppShell({ initialPath: "/topics", routes });

    const header = screen.getByRole("banner");
    const main = screen.getByRole("main");
    const sidebar = screen.getByRole("complementary", {
      name: "Workspace navigation"
    });

    expect(header).toHaveClass(
      "transition-[background-color,box-shadow]",
      "duration-300",
      "ease-out",
      "z-10",
      "bg-transparent",
      "shadow-none"
    );
    expect(sidebar).toHaveClass("z-20");

    fireEvent.scroll(main, { target: { scrollTop: 12 } });

    expect(header).toHaveClass("bg-card", "shadow-sm");

    fireEvent.scroll(main, { target: { scrollTop: 0 } });

    expect(header).toHaveClass("bg-transparent", "shadow-none");
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
  contentClassName?: string;
  initialPath: string;
  onSidebarOpenChange?: (open: boolean) => void;
  routes: readonly AnyAppShellRoute[];
  sidebarOpen?: boolean;
};

async function renderAppShell({
  children = "Main content",
  contentClassName,
  initialPath,
  onSidebarOpenChange,
  routes,
  sidebarOpen
}: RenderAppShellOptions) {
  const rootRoute = createRootRoute({
    component: () => (
      <AppShell
        contentClassName={contentClassName}
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
