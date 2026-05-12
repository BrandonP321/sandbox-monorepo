import { useMemo } from "react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider
} from "@tanstack/react-router";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bell, LayoutDashboard, Settings } from "lucide-react";

import { AppShell, defineAppShellRoutes } from "../AppShell";
import { Button } from "../Button";
import { Flashbar, type FlashbarProps } from "./Flashbar";

const meta = {
  title: "UI/Flashbar",
  component: Flashbar,
  decorators: [
    (Story, context) =>
      context.parameters.layout === "fullscreen" ? (
        <Story />
      ) : (
        <div className="w-full max-w-xl">
          <Story />
        </div>
      )
  ]
} satisfies Meta<typeof Flashbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InfoDefault: Story = {
  args: {
    notifications: [
      {
        content: "Evidence can be attached after the topic has enough context.",
        header: "Evidence can wait.",
        id: "evidence-can-wait",
        type: "info"
      }
    ]
  }
};

export const AllTypes: Story = {
  args: {
    notifications: [
      {
        content: "The topic is available in the active topic list.",
        id: "success",
        type: "success"
      },
      {
        content: "Save or discard edits before leaving this view.",
        id: "warning",
        type: "warning"
      },
      {
        content: "Resolve the API error before trying again.",
        header: "Topic could not be deleted.",
        id: "error",
        type: "error"
      },
      {
        content: "Evidence can be attached after the topic has enough context.",
        id: "info",
        type: "info"
      }
    ]
  }
};

export const StackedWithActions: Story = {
  args: {
    notifications: [
      {
        action: <Button variant="outline">Review topic</Button>,
        content: "The topic is available in the active topic list.",
        header: "Topic created.",
        id: "created",
        type: "success"
      },
      {
        action: <Button variant="outline">Retry</Button>,
        content: "Retry the request without leaving the page.",
        dismissLabel: "Dismiss load failure",
        header: "Topics could not be loaded.",
        id: "load-failed",
        type: "error"
      },
      {
        content: "Save or discard edits before leaving this view.",
        dismissLabel: "Dismiss unsaved changes warning",
        header: "Unsaved changes.",
        id: "unsaved",
        type: "warning"
      }
    ]
  }
};

export const InsideBasicAppShell: Story = {
  args: {
    notifications: [
      {
        action: <Button variant="outline">Review topic</Button>,
        content: "The topic is available in the active topic list.",
        header: "Topic created.",
        id: "created",
        type: "success"
      },
      {
        action: <Button variant="outline">Retry</Button>,
        content: "Retry the request without leaving the page.",
        dismissLabel: "Dismiss load failure",
        header: "Topics could not be loaded.",
        id: "load-failed",
        type: "error"
      }
    ]
  },
  parameters: {
    layout: "fullscreen"
  },
  render: (args) => <FlashbarAppShellStory {...args} />
};

const appShellRoutes = defineAppShellRoutes([
  {
    icon: <LayoutDashboard className="size-4" />,
    id: "overview",
    path: "/overview",
    title: "Overview"
  },
  {
    icon: <Bell className="size-4" />,
    id: "notifications",
    path: "/notifications",
    title: "Notifications"
  },
  {
    icon: <Settings className="size-4" />,
    id: "settings",
    path: "/settings",
    title: "Settings"
  }
]);

function FlashbarAppShellStory(args: Story["args"]) {
  const flashbarProps = {
    ...args,
    notifications: args.notifications ?? []
  } satisfies FlashbarProps;
  const router = useMemo(
    () => createFlashbarAppShellRouter(flashbarProps),
    [flashbarProps]
  );

  return <RouterProvider router={router} />;
}

function createFlashbarAppShellRouter(flashbarProps: FlashbarProps) {
  const rootRoute = createRootRoute({
    component: () => (
      <AppShell
        className="w-screen"
        routes={appShellRoutes}
        sidebarBrand={<FlashbarAppShellBrand />}
        sidebarLabel="Example navigation"
      >
        <FlashbarAppShellContent flashbarProps={flashbarProps} />
      </AppShell>
    )
  });
  const overviewRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/overview",
    component: EmptyRouteComponent
  });
  const notificationsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/notifications",
    component: EmptyRouteComponent
  });
  const settingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/settings",
    component: EmptyRouteComponent
  });

  return createRouter({
    history: createMemoryHistory({ initialEntries: ["/notifications"] }),
    routeTree: rootRoute.addChildren([
      overviewRoute,
      notificationsRoute,
      settingsRoute
    ])
  });
}

function EmptyRouteComponent() {
  return null;
}

function FlashbarAppShellBrand() {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span
        aria-hidden="true"
        className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-semibold"
      >
        F
      </span>
      <div className="min-w-0">
        <p className="text-foreground truncate text-sm font-semibold">
          Flashbar
        </p>
        <p className="text-muted-foreground truncate text-xs">Shell example</p>
      </div>
    </div>
  );
}

function FlashbarAppShellContent({
  flashbarProps
}: {
  flashbarProps: FlashbarProps;
}) {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6">
      <Flashbar {...flashbarProps} />
      <div className="grid gap-3">
        {["Overview", "Recent activity", "Follow-up queue"].map((title) => (
          <section
            className="bg-card text-card-foreground border-border/80 rounded-xl border p-5 shadow-sm"
            key={title}
          >
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Flashbar alerts sit above the page content while the shell keeps
              navigation and breadcrumbs in place.
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
