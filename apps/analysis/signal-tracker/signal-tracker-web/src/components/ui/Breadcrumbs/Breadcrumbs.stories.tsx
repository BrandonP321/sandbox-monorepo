import { useMemo } from "react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider
} from "@tanstack/react-router";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FolderKanban, Home } from "lucide-react";

import {
  Breadcrumbs,
  type BreadcrumbsItem,
  type BreadcrumbsProps
} from "./Breadcrumbs";

const meta = {
  title: "UI/Breadcrumbs",
  component: Breadcrumbs,
  args: {
    items: [
      {
        icon: <Home className="size-4" />,
        id: "home",
        title: "Home",
        to: "/"
      },
      {
        icon: <FolderKanban className="size-4" />,
        id: "projects",
        title: "Projects",
        to: "/projects"
      },
      {
        id: "project-nero",
        params: { projectId: "project-nero" },
        title: "Project Nero",
        to: "/projects/$projectId"
      }
    ]
  }
} satisfies Meta<typeof Breadcrumbs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <BreadcrumbsStory args={args} />
};

export const NarrowContainer: Story = {
  args: {
    items: [
      ...meta.args.items,
      {
        id: "activity",
        params: { activityId: "briefing", projectId: "project-nero" },
        title: "Senior leadership briefing timeline",
        to: "/projects/$projectId/activity/$activityId"
      }
    ]
  },
  render: (args) => <BreadcrumbsStory args={args} containerWidth="20rem" />
};

export const LongLabels: Story = {
  args: {
    items: [
      meta.args.items[0],
      {
        id: "projects",
        title: "Projects with exceptionally long names",
        to: "/projects"
      },
      {
        id: "project-nero",
        params: { projectId: "project-nero" },
        title: "Project Nero regional continuity assessment",
        to: "/projects/$projectId"
      }
    ],
    maxBreadcrumbLength: 20
  },
  render: (args) => <BreadcrumbsStory args={args} containerWidth="34rem" />
};

function BreadcrumbsStory({
  args,
  containerWidth = "min(44rem, calc(100vw - 2rem))"
}: {
  args: BreadcrumbsProps;
  containerWidth?: string;
}) {
  const router = useMemo(() => createBreadcrumbsStoryRouter(args), [args]);

  return (
    <div
      className="bg-background text-foreground rounded-lg border p-4"
      style={{ width: containerWidth }}
    >
      <RouterProvider router={router} />
    </div>
  );
}

function createBreadcrumbsStoryRouter(args: BreadcrumbsProps) {
  const rootRoute = createRootRoute({
    component: () => <Breadcrumbs {...args} />
  });
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: EmptyRouteComponent
  });
  const projectsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/projects",
    component: EmptyRouteComponent
  });
  const projectRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/projects/$projectId",
    component: EmptyRouteComponent
  });
  const activityRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/projects/$projectId/activity/$activityId",
    component: EmptyRouteComponent
  });

  return createRouter({
    history: createMemoryHistory({
      initialEntries: [getInitialPath(args.items)]
    }),
    routeTree: rootRoute.addChildren([
      homeRoute,
      projectsRoute,
      projectRoute,
      activityRoute
    ])
  });
}

function getInitialPath(items: readonly BreadcrumbsItem[]) {
  const lastItem = items.at(-1);

  if (!lastItem) {
    return "/";
  }

  return lastItem.to
    .replace("$projectId", lastItem.params?.projectId ?? "project-nero")
    .replace("$activityId", lastItem.params?.activityId ?? "briefing");
}

function EmptyRouteComponent() {
  return null;
}
