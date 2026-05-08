import { useMemo } from "react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider
} from "@tanstack/react-router";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Activity, LayoutDashboard, Settings } from "lucide-react";

import { AppShell, defineAppShellRoutes } from "./index";

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

export const Basic: Story = {
  args: {
    children: <AppShellStoryContent />,
    className: "w-screen",
    routes,
    sidebarLabel: "Workspace navigation"
  },
  render: (args) => <AppShellStory args={args} />
};

function AppShellStory({ args }: { args: Story["args"] }) {
  const router = useMemo(() => createAppShellStoryRouter(args), [args]);

  return <RouterProvider router={router} />;
}

function createAppShellStoryRouter(args: Story["args"]) {
  const rootRoute = createRootRoute({
    component: () => <AppShell {...args} />
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
    history: createMemoryHistory({ initialEntries: ["/workspace/current"] }),
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
        <h2 className="text-xl font-semibold">App shell content</h2>
        <p className="text-muted-foreground text-sm">
          The main region scrolls independently once page content exceeds the
          viewport.
        </p>
      </div>

      <div className="grid gap-3">
        {contentBlocks.map((block) => (
          <section
            className="border-border bg-card text-card-foreground rounded-lg border p-4 shadow-xs"
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
