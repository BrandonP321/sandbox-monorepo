import { useEffect, useMemo } from "react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider
} from "@tanstack/react-router";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Activity, LayoutDashboard, Settings } from "lucide-react";
import { useNotifications } from "@repo/ui-base/notifications";

import { Button } from "../../components/Button";
import { AppShell, defineAppShellRoutes, type AppShellProps } from "./index";

const meta = {
  title: "Components/AppShell",
  component: AppShell,
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof AppShell>;

export default meta;

type Story = StoryObj<typeof meta>;

const contentBlocks = Array.from({ length: 14 }, (_, index) => ({
  description:
    "Dense workspace content stays inside the main region while the shell header and navigation remain fixed in place.",
  title: `Workspace section ${index + 1}`
}));

const routes = defineAppShellRoutes([
  {
    description: "Monitor the current dashboard overview.",
    icon: <LayoutDashboard className="size-4" />,
    id: "overview",
    path: "/overview",
    title: "Overview"
  },
  {
    children: [
      {
        description: "Review the current topic workspace.",
        id: "workspace-current",
        path: "/workspace/current",
        title: "Current topic"
      }
    ],
    icon: <Activity className="size-4" />,
    id: "workspace",
    path: "/workspace",
    title: "Workspace"
  },
  {
    description: "Adjust dashboard workspace settings.",
    icon: <Settings className="size-4" />,
    id: "settings",
    path: "/settings",
    title: "Settings"
  }
]);

const longLabelRoutes = defineAppShellRoutes([
  {
    icon: <LayoutDashboard className="size-4" />,
    id: "overview",
    navLinkTitle:
      "Overview with an intentionally long navigation label that should truncate",
    path: "/overview",
    title: "Overview"
  },
  {
    children: [
      {
        id: "workspace-current",
        navLinkTitle:
          "Current topic with a long generated display name that cannot fit",
        path: "/workspace/current",
        title: "Current topic"
      }
    ],
    icon: <Activity className="size-4" />,
    id: "workspace",
    navLinkTitle:
      "Workspace branch with a long parent label that still reserves an icon",
    path: "/workspace",
    title: "Workspace"
  },
  {
    icon: <Settings className="size-4" />,
    id: "settings",
    navLinkTitle:
      "Settings and administration with extra copy that exceeds the sidebar",
    path: "/settings",
    title: "Settings"
  }
]);

const baseArgs = {
  appName: "Workspace",
  children: <AppShellStoryContent />,
  className: "w-screen",
  routes,
  sidebarBrand: <AppShellStoryBrand />,
  sidebarLabel: "Workspace navigation"
} satisfies AppShellProps;

export const Basic: Story = {
  args: baseArgs,
  render: (args) => <AppShellStory args={args} />
};

export const NestedRoute: Story = {
  args: baseArgs,
  render: (args) => (
    <AppShellStory args={args} initialPath="/workspace/current" />
  )
};

export const LongSidebarLabels: Story = {
  args: {
    ...baseArgs,
    routes: longLabelRoutes
  },
  render: (args) => (
    <AppShellStory args={args} initialPath="/workspace/current" />
  )
};

export const CollapsedSidebar: Story = {
  args: {
    ...baseArgs,
    defaultSidebarOpen: false
  },
  render: (args) => <AppShellStory args={args} initialPath="/settings" />
};

export const ScrolledHeader: Story = {
  args: baseArgs,
  render: (args) => <AppShellStory args={args} initialMainScrollTop={64} />
};

export const WithNotifications: Story = {
  args: {
    ...baseArgs,
    children: <AppShellNotificationStoryContent />,
    notificationFlashbarClassName: "mx-auto w-full max-w-5xl"
  },
  render: (args) => <AppShellStory args={args} />
};

function AppShellStory({
  args,
  initialMainScrollTop,
  initialPath = "/overview"
}: {
  args: Story["args"];
  initialMainScrollTop?: number;
  initialPath?: string;
}) {
  const router = useMemo(
    () => createAppShellStoryRouter(args, initialPath),
    [args, initialPath]
  );

  useEffect(() => {
    if (initialMainScrollTop === undefined) {
      return;
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      const main = document.querySelector<HTMLElement>(
        "[data-slot='app-shell-main']"
      );

      if (!main) {
        return;
      }

      main.scrollTop = initialMainScrollTop;
      main.dispatchEvent(new Event("scroll", { bubbles: true }));
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [initialMainScrollTop]);

  return <RouterProvider router={router} />;
}

function createAppShellStoryRouter(args: Story["args"], initialPath: string) {
  const appShellProps = { ...baseArgs, ...args };
  const rootRoute = createRootRoute({
    component: () => <AppShell {...appShellProps} />
  });
  const overviewRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/overview",
    component: EmptyRouteComponent
  });
  const workspaceRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/workspace",
    component: EmptyRouteComponent
  });
  const workspaceCurrentRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/workspace/current",
    component: EmptyRouteComponent
  });
  const settingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/settings",
    component: EmptyRouteComponent
  });

  return createRouter({
    history: createMemoryHistory({ initialEntries: [initialPath] }),
    routeTree: rootRoute.addChildren([
      overviewRoute,
      workspaceRoute,
      workspaceCurrentRoute,
      settingsRoute
    ])
  });
}

function EmptyRouteComponent() {
  return null;
}

function AppShellStoryBrand() {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span
        aria-hidden="true"
        className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-semibold"
      >
        W
      </span>
      <div className="min-w-0">
        <p className="text-foreground truncate text-sm font-semibold">
          Workspace
        </p>
        <p className="text-muted-foreground truncate text-xs">Research desk</p>
      </div>
    </div>
  );
}

function AppShellStoryContent() {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-4">
      <div className="grid gap-2">
        <h2 className="text-foreground text-xl font-semibold">
          App shell content
        </h2>
        <p className="text-muted-foreground text-sm">
          The main region scrolls independently once page content exceeds the
          viewport.
        </p>
      </div>

      <div className="grid gap-3">
        {contentBlocks.map((block) => (
          <section
            className="bg-card text-card-foreground rounded-xl p-5"
            key={block.title}
          >
            <h3 className="text-base font-semibold">{block.title}</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              {block.description}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}

function AppShellNotificationStoryContent() {
  const { notifySuccess, notifyWarning } = useNotifications();

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-4">
      <div className="grid gap-2">
        <h2 className="text-foreground text-xl font-semibold">
          Regional risk review
        </h2>
        <p className="text-muted-foreground text-sm">
          Keep the latest update visible while reviewing active indicators.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={() =>
            notifySuccess({
              content: "The topic update is visible in the workspace.",
              header: "Topic updated."
            })
          }
        >
          Show success
        </Button>
        <Button
          onClick={() =>
            notifyWarning("Review citations before publishing the topic.")
          }
          variant="outline"
        >
          Show warning
        </Button>
      </div>

      <section className="bg-card text-card-foreground rounded-xl p-5">
        <h3 className="text-base font-semibold">Active indicators</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          Official statements, force posture, and credible reporting are ready
          for review.
        </p>
      </section>
    </div>
  );
}
