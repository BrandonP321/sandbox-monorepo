import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider
} from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { appRoutes } from "@/routeRegistry";

import { ButtonLink } from "./ButtonLink";

const meta = {
  title: "UI/ButtonLink",
  parameters: {
    layout: "centered"
  },
  decorators: [
    (Story) => (
      <ButtonLinkStoryRouter>
        <Story />
      </ButtonLinkStoryRouter>
    )
  ]
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ButtonLink to={appRoutes.listTopics.path}>Back to topics</ButtonLink>
  )
};

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <ButtonLink to={appRoutes.listTopics.path}>Default link</ButtonLink>
      <ButtonLink to={appRoutes.listTopics.path} variant="outline">
        Outline link
      </ButtonLink>
      <ButtonLink
        iconRight={<ArrowRight aria-hidden="true" className="size-4" />}
        to={appRoutes.listTopics.path}
        variant="ghost"
      >
        Ghost link
      </ButtonLink>
    </div>
  )
};

export const Loading: Story = {
  render: () => (
    <ButtonLink
      isLoading
      loadingLabel="Loading..."
      to={appRoutes.listTopics.path}
    >
      Back to topics
    </ButtonLink>
  )
};

function ButtonLinkStoryRouter({ children }: { children: ReactNode }) {
  const rootRoute = createRootRoute({
    component: () => children
  });
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: appRoutes.home.path,
    component: EmptyRouteComponent
  });
  const listTopicsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: appRoutes.listTopics.path,
    component: EmptyRouteComponent
  });
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: [appRoutes.home.path] }),
    routeTree: rootRoute.addChildren([homeRoute, listTopicsRoute])
  });

  return <RouterProvider router={router} />;
}

function EmptyRouteComponent() {
  return null;
}
