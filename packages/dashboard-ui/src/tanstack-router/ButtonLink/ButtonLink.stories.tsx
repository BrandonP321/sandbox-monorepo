import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider
} from "@tanstack/react-router";
import { ArrowRight, Plus } from "lucide-react";

import { ButtonLink } from "./ButtonLink";

const testRoutes = {
  home: {
    path: "/"
  },
  listTopics: {
    path: "/topics"
  }
} as const;

const meta = {
  title: "Components/ButtonLink",
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
    <ButtonLink to={testRoutes.listTopics.path}>Back to topics</ButtonLink>
  )
};

export const Variants: Story = {
  render: () => (
    <div className="flex w-full max-w-md flex-wrap items-center gap-2">
      <ButtonLink to={testRoutes.listTopics.path}>Default link</ButtonLink>
      <ButtonLink to={testRoutes.listTopics.path} variant="secondary">
        Secondary link
      </ButtonLink>
      <ButtonLink to={testRoutes.listTopics.path} variant="outline">
        Outline link
      </ButtonLink>
      <ButtonLink
        iconRight={<ArrowRight aria-hidden="true" className="size-4" />}
        to={testRoutes.listTopics.path}
        variant="ghost"
      >
        Ghost link
      </ButtonLink>
      <ButtonLink
        iconLeft={<Plus aria-hidden="true" className="size-4" />}
        to={testRoutes.listTopics.path}
      >
        New topic
      </ButtonLink>
    </div>
  )
};

export const Loading: Story = {
  render: () => (
    <ButtonLink
      isLoading
      loadingLabel="Loading..."
      to={testRoutes.listTopics.path}
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
