import { fireEvent, render, screen, within } from "@testing-library/react";
import type * as React from "react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider
} from "@tanstack/react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

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
        title: ({ params }) => `Topic: ${params.topicTitle}`,
        breadcrumbTitle: ({ params }) => params.topicTitle,
        navLinkTitle: ({ params }) => params.topicTitle,
        visibleWhen: "activeBranch"
      })
    ],
    id: "topics",
    path: "/topics",
    title: "Topics"
  }
]);

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: originalMatchMedia,
    writable: true
  });
});

describe("AppShell", () => {
  it("renders the shell regions together", async () => {
    await renderAppShell({ initialPath: "/topics", routes });

    const sidebar = screen.getByRole("complementary", {
      name: "Workspace navigation"
    });

    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveClass(
      "fixed",
      "inset-0",
      "z-40",
      "border-border/60",
      "transition-transform",
      "duration-300",
      "ease-out",
      "translate-x-0",
      "md:border-r",
      "md:relative",
      "md:z-20",
      "md:transition-[margin,opacity,transform]",
      "md:w-64"
    );
    expect(
      sidebar.querySelector('[data-slot="app-shell-sidebar-scroll-area"]')
    ).toHaveClass(
      "min-h-0",
      "flex-1",
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

    const navigation = within(
      screen.getByRole("complementary", { name: "Workspace navigation" })
    );

    expect(navigation.getByRole("link", { name: "Topics" })).toHaveAttribute(
      "href",
      "/topics"
    );
    expect(navigation.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(
      within(screen.getByRole("banner")).getByRole("link", {
        name: "Settings"
      })
    ).toHaveAttribute("aria-current", "page");
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
    expect(sidebar).toHaveClass("z-40", "md:z-20");

    fireEvent.scroll(main, { target: { scrollTop: 12 } });

    expect(header).toHaveClass("bg-card", "shadow-sm");

    fireEvent.scroll(main, { target: { scrollTop: 0 } });

    expect(header).toHaveClass("bg-transparent", "shadow-none");
  });

  it("uses route-specific labels for nested links and active header titles", async () => {
    await renderAppShell({
      initialPath: "/topics/topic-1/Iran%20strike%20risk",
      routes: nestedRoutes
    });

    const navigation = within(
      screen.getByRole("complementary", { name: "Workspace navigation" })
    );
    const header = within(screen.getByRole("banner"));

    expect(
      navigation.getByRole("link", { name: "Topics" })
    ).not.toHaveAttribute("aria-current");
    expect(
      navigation.getByRole("link", { name: "Iran strike risk" })
    ).toHaveAttribute("aria-current", "page");
    expect(
      navigation.getByRole("link", { name: "Iran strike risk" })
    ).toHaveAttribute("href", "/topics/topic-1/Iran%20strike%20risk");
    expect(header.getByRole("link", { name: "Topics" })).toHaveAttribute(
      "href",
      "/topics"
    );
    expect(
      header.getByRole("link", { name: "Iran strike risk" })
    ).toHaveAttribute("href", "/topics/topic-1/Iran%20strike%20risk");
  });

  it("hides active-branch route links until that branch is active", async () => {
    await renderAppShell({
      initialPath: "/topics",
      routes: nestedRoutes
    });

    const navigation = within(
      screen.getByRole("complementary", { name: "Workspace navigation" })
    );

    expect(navigation.getByRole("link", { name: "Topics" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(
      navigation.queryByRole("link", { name: "Iran strike risk" })
    ).not.toBeInTheDocument();
  });

  it("lets the sidebar toggle open and close navigation", async () => {
    const { container } = await renderAppShell({
      initialPath: "/topics",
      routes
    });

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

    const sidebar = getSidebarElement(container);

    expect(sidebar).toHaveAttribute("aria-hidden", "true");
    expect(sidebar).toHaveAttribute("data-state", "closed");
    expect(sidebar).toHaveAttribute("inert");
    expect(sidebar).toHaveClass(
      "pointer-events-none",
      "-translate-x-full",
      "md:-ml-64",
      "md:opacity-0"
    );
  });

  it("defaults the responsive sidebar open for desktop viewports", async () => {
    await renderAppShell({
      initialPath: "/topics",
      routes,
      useResponsiveSidebarDefault: true
    });

    const sidebar = screen.getByRole("complementary", {
      name: "Workspace navigation"
    });

    expect(sidebar).toBeInTheDocument();
    expect(
      within(sidebar).queryByRole("button", { name: "Close navigation" })
    ).not.toBeInTheDocument();
  });

  it("defaults the responsive sidebar closed as a fullscreen overlay for narrow viewports", async () => {
    await renderAppShell({
      initialPath: "/topics",
      isDesktopViewport: false,
      routes,
      useResponsiveSidebarDefault: true
    });

    expect(
      screen.queryByRole("complementary", { name: "Workspace navigation" })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Expand navigation" }));

    const sidebar = screen.getByRole("complementary", {
      name: "Workspace navigation"
    });

    expect(sidebar).toHaveClass(
      "fixed",
      "inset-0",
      "z-40",
      "w-full",
      "supports-[height:100svh]:h-svh"
    );
    expect(
      within(sidebar).getByRole("button", { name: "Close navigation" })
    ).toBeInTheDocument();

    fireEvent.click(
      within(sidebar).getByRole("button", { name: "Close navigation" })
    );

    expect(
      screen.queryByRole("complementary", { name: "Workspace navigation" })
    ).not.toBeInTheDocument();
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
  defaultSidebarOpen?: boolean;
  initialPath: string;
  isDesktopViewport?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
  routes: readonly AnyAppShellRoute[];
  sidebarOpen?: boolean;
  useResponsiveSidebarDefault?: boolean;
};

async function renderAppShell({
  children = "Main content",
  contentClassName,
  defaultSidebarOpen = true,
  initialPath,
  isDesktopViewport = true,
  onSidebarOpenChange,
  routes,
  sidebarOpen,
  useResponsiveSidebarDefault = false
}: RenderAppShellOptions) {
  installMatchMediaMock(isDesktopViewport);

  const rootRoute = createRootRoute({
    component: () => (
      <AppShell
        contentClassName={contentClassName}
        {...(useResponsiveSidebarDefault ? {} : { defaultSidebarOpen })}
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

function getSidebarElement(container: HTMLElement) {
  const sidebar = container.querySelector<HTMLElement>(
    '[data-slot="app-shell-sidebar"]'
  );

  if (!sidebar) {
    throw new Error("Expected AppShell sidebar to be mounted.");
  }

  return sidebar;
}

function installMatchMediaMock(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn((query: string): MediaQueryList => {
      return {
        matches,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        addListener: vi.fn(),
        dispatchEvent: vi.fn(() => false),
        removeEventListener: vi.fn(),
        removeListener: vi.fn()
      };
    }),
    writable: true
  });
}
