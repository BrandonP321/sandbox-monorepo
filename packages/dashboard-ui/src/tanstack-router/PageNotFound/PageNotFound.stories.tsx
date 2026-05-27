import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider
} from "@tanstack/react-router";

import { PageNotFound } from "./PageNotFound";

const testRoutes = {
  home: {
    path: "/"
  },
  listTopics: {
    path: "/topics"
  }
} as const;

const meta = {
  title: "Components/PageNotFound",
  component: PageNotFound,
  parameters: {
    layout: "fullscreen"
  },
  decorators: [
    (Story) => (
      <div className="bg-background min-h-screen w-full">
        <PageNotFoundStoryRouter>
          <Story />
        </PageNotFoundStoryRouter>
      </div>
    )
  ]
} satisfies Meta<typeof PageNotFound>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TopicsHome: Story = {
  args: {
    homeLabel: "View active topics",
    homePath: testRoutes.listTopics.path
  }
};

function PageNotFoundStoryRouter({ children }: { children: ReactNode }) {
  const rootRoute = createRootRoute({
    component: () => children
  });
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: testRoutes.home.path,
    component: EmptyRouteComponent
  });
  const listTopicsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: testRoutes.listTopics.path,
    component: EmptyRouteComponent
  });
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: [testRoutes.home.path] }),
    routeTree: rootRoute.addChildren([homeRoute, listTopicsRoute])
  });

  return <RouterProvider router={router} />;
}

function EmptyRouteComponent() {
  return null;
}
