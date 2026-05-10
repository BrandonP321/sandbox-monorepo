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

import { AppShell, defineAppShellRoutes, type AppShellProps } from "./index";

const meta = {
  title: "UI/AppShell",
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
    icon: <LayoutDashboard className="size-4" />,
    id: "overview",
    path: "/overview",
    title: "Overview"
  },
  {
    children: [
      {
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
    icon: <Settings className="size-4" />,
    id: "settings",
    path: "/settings",
    title: "Settings"
  }
]);

const baseArgs = {
  children: <AppShellStoryContent />,
  className: "w-screen",
  routes,
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
