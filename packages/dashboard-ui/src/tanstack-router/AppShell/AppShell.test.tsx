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
import { useNotifications } from "@repo/ui-base/notifications";

import {
  AppShell,
  type AnyAppShellRoute,
  defineAppShellRoute,
  defineAppShellRoutes,
  useAppShellContext
} from "./index";

const routes = defineAppShellRoutes([
  {
    description: "Review active workspace topics.",
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

const longLabelRoutes = defineAppShellRoutes([
  {
    id: "topics",
    navLinkTitle:
      "Topics with a very long sidebar label that must truncate inside the nav item",
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
        icon: <span>Topic detail icon</span>,
        id: "topic-1",
        params: ({ params }) => ({
          topicId: params.topicId,
          topicTitle: params.topicTitle
        }),
        path: "/topics/$topicId/$topicTitle",
        description: ({ params }) =>
          `Review continuity signals for ${params.topicTitle}.`,
        title: ({ params }) => `Topic: ${params.topicTitle}`,
        breadcrumbTitle: ({ params }) => params.topicTitle,
        navLinkTitle: ({ params }) => params.topicTitle,
        visibleWhen: "activeBranch"
      })
    ],
    icon: <span>Topics icon</span>,
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

  it("renders optional sidebar brand content above route navigation", async () => {
    await renderAppShell({
      initialPath: "/topics",
      routes,
      sidebarBrand: <div>Workspace brand</div>
    });

    const sidebar = screen.getByRole("complementary", {
      name: "Workspace navigation"
    });
    const brand = sidebar.querySelector(
      '[data-slot="app-shell-sidebar-brand"]'
    );
    const navigation = within(sidebar).getByRole("navigation", {
      name: "Routes"
    });

    if (!brand) {
      throw new Error("Expected AppShell sidebar brand to be mounted.");
    }

    expect(brand).toHaveTextContent("Workspace brand");
    expect(
      brand.compareDocumentPosition(navigation) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
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

  it("sets page metadata from the active route and app name", async () => {
    await renderAppShell({
      appName: "Signal Tracker",
      initialPath: "/topics",
      routes
    });

    expect(document.title).toBe("Topics | Signal Tracker");
    expect(
      document.head
        .querySelector('meta[name="description"]')
        ?.getAttribute("content")
    ).toBe("Review active workspace topics.");
  });

  it("constrains long sidebar labels so navigation text can truncate", async () => {
    await renderAppShell({ initialPath: "/topics", routes: longLabelRoutes });

    const sidebar = screen.getByRole("complementary", {
      name: "Workspace navigation"
    });
    const navigation = within(sidebar).getByRole("navigation", {
      name: "Routes"
    });
    const longLabel =
      "Topics with a very long sidebar label that must truncate inside the nav item";
    const link = within(navigation).getByRole("link", { name: longLabel });
    const list = within(navigation).getByRole("list");
    const label = link.querySelector(
      '[data-slot="app-shell-navigation-label"]'
    );
    const item = link.closest("li");

    if (!label || !item) {
      throw new Error("Expected AppShell navigation item structure.");
    }

    expect(navigation).toHaveClass("min-w-0");
    expect(list).toHaveClass("min-w-0");
    expect(item).toHaveClass("min-w-0");
    expect(link).toHaveClass("min-w-0");
    expect(label).toHaveClass("min-w-0", "flex-1", "truncate");
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
      appName: "Signal Tracker",
      appNamePlacement: "prefix",
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
    expect(document.title).toBe("Signal Tracker | Topic: Iran strike risk");
    expect(
      document.head
        .querySelector('meta[name="description"]')
        ?.getAttribute("content")
    ).toBe("Review continuity signals for Iran strike risk.");
  });

  it("renders route icons only for parent navigation links and aligns child labels with parent labels", async () => {
    await renderAppShell({
      initialPath: "/topics/topic-1/Iran%20strike%20risk",
      routes: nestedRoutes
    });

    const navigation = within(
      screen.getByRole("complementary", { name: "Workspace navigation" })
    );
    const parentLink = navigation.getByRole("link", { name: "Topics" });
    const childLink = navigation.getByRole("link", {
      name: "Iran strike risk"
    });
    const navigationLists = navigation.getAllByRole("list");
    const childList = parentLink.closest("li")?.querySelector("ul");

    expect(
      parentLink.querySelector('[data-slot="app-shell-navigation-icon"]')
    ).toBeInTheDocument();
    expect(
      parentLink.querySelector('[data-slot="app-shell-navigation-icon"]')
    ).toHaveClass("text-primary");
    expect(
      childLink.querySelector('[data-slot="app-shell-navigation-icon"]')
    ).not.toBeInTheDocument();
    expect(parentLink).toHaveClass("px-3", "py-2", "text-sm");
    expect(parentLink).toHaveClass("hover:bg-accent/40");
    expect(parentLink).not.toHaveClass(
      "bg-accent/70",
      "bg-muted/70",
      "text-foreground"
    );
    expect(navigationLists[0]).toHaveClass("gap-1.5");
    expect(childList).toHaveClass("gap-1.5", "mt-1.5");
    expect(childLink).toHaveClass("py-2", "pr-3", "pl-9", "text-sm");
    expect(childLink).toHaveClass("bg-accent/70");
    expect(childLink).not.toHaveClass("hover:bg-accent/40");
    expect(childLink.className).not.toContain("before:");
    expect(childLink).not.toHaveTextContent("Topic detail icon");
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
      navigation
        .getByRole("link", { name: "Topics" })
        .querySelector('[data-slot="app-shell-navigation-icon"]')
    ).toHaveClass("text-primary");
    expect(
      navigation.getByRole("link", { name: "Topics" }).className
    ).not.toContain("before:");
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
    expect(getSidebarCloseElement(sidebar)).toHaveClass(
      "absolute",
      "top-4",
      "right-4",
      "z-10",
      "md:hidden"
    );
    expect(getSidebarCloseElement(sidebar)).not.toHaveClass("mb-4");
    expect(
      sidebar.querySelector('[data-slot="app-shell-sidebar-scroll-area"]')
    ).toHaveClass("pt-12");

    fireEvent.click(
      within(sidebar).getByRole("button", { name: "Close navigation" })
    );

    expect(
      screen.queryByRole("complementary", { name: "Workspace navigation" })
    ).not.toBeInTheDocument();
  });

  it("keeps the mobile close control from pushing branded sidebar content down", async () => {
    await renderAppShell({
      initialPath: "/topics",
      isDesktopViewport: false,
      routes,
      sidebarBrand: <div>Workspace brand</div>,
      useResponsiveSidebarDefault: true
    });

    fireEvent.click(screen.getByRole("button", { name: "Expand navigation" }));

    const sidebar = screen.getByRole("complementary", {
      name: "Workspace navigation"
    });
    const brand = sidebar.querySelector(
      '[data-slot="app-shell-sidebar-brand"]'
    );
    const scrollArea = sidebar.querySelector(
      '[data-slot="app-shell-sidebar-scroll-area"]'
    );

    if (!brand || !scrollArea) {
      throw new Error("Expected branded AppShell sidebar content.");
    }

    expect(getSidebarCloseElement(sidebar)).toHaveClass("absolute");
    expect(brand).toHaveClass("pr-12", "md:pr-0");
    expect(scrollArea).not.toHaveClass("pt-12");
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

  it("provides a root notification flashbar inside the main scroll region", async () => {
    await renderAppShell({
      children: (
        <>
          <NotifySuccessButton />
          <NotifyWarningButton />
          <span>Main content</span>
        </>
      ),
      initialPath: "/topics",
      notificationFlashbarClassName: "mx-auto max-w-5xl",
      routes
    });

    fireEvent.click(screen.getByRole("button", { name: "Show notification" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Show warning notification" })
    );

    const main = screen.getByRole("main");
    const flashbar = within(main).getByRole("region", {
      name: "Notifications"
    });

    expect(flashbar).toHaveClass("mb-4", "mx-auto", "max-w-5xl");
    expect(within(flashbar).getByText("Topic created.")).toBeInTheDocument();
    expect(
      within(flashbar).getByText("Review the topic before publishing.")
    ).toBeInTheDocument();
    expect(
      flashbar.compareDocumentPosition(screen.getByText("Main content")) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
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
  appName?: string;
  appNamePlacement?: "prefix" | "suffix";
  children?: React.ReactNode;
  contentClassName?: string;
  defaultSidebarOpen?: boolean;
  initialPath: string;
  isDesktopViewport?: boolean;
  notificationFlashbarClassName?: string;
  onSidebarOpenChange?: (open: boolean) => void;
  routes: readonly AnyAppShellRoute[];
  sidebarBrand?: React.ReactNode;
  sidebarOpen?: boolean;
  useResponsiveSidebarDefault?: boolean;
};

async function renderAppShell({
  appName,
  appNamePlacement,
  children = "Main content",
  contentClassName,
  defaultSidebarOpen = true,
  initialPath,
  isDesktopViewport = true,
  notificationFlashbarClassName,
  onSidebarOpenChange,
  routes,
  sidebarBrand,
  sidebarOpen,
  useResponsiveSidebarDefault = false
}: RenderAppShellOptions) {
  installMatchMediaMock(isDesktopViewport);

  const rootRoute = createRootRoute({
    component: () => (
      <AppShell
        appName={appName}
        appNamePlacement={appNamePlacement}
        contentClassName={contentClassName}
        {...(useResponsiveSidebarDefault ? {} : { defaultSidebarOpen })}
        notificationFlashbarClassName={notificationFlashbarClassName}
        onSidebarOpenChange={onSidebarOpenChange}
        routes={routes}
        sidebarBrand={sidebarBrand}
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

function NotifySuccessButton() {
  const { notifySuccess } = useNotifications();

  return (
    <button onClick={() => notifySuccess("Topic created.")} type="button">
      Show notification
    </button>
  );
}

function NotifyWarningButton() {
  const { notifyWarning } = useNotifications();

  return (
    <button
      onClick={() => notifyWarning("Review the topic before publishing.")}
      type="button"
    >
      Show warning notification
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

function getSidebarCloseElement(container: HTMLElement) {
  const closeElement = container.querySelector<HTMLElement>(
    '[data-slot="app-shell-sidebar-close"]'
  );

  if (!closeElement) {
    throw new Error("Expected AppShell sidebar close control to be mounted.");
  }

  return closeElement;
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
