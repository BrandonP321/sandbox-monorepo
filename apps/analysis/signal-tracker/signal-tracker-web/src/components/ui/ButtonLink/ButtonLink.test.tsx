import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider
} from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { appRoutes } from "@/routeRegistry";

import { ButtonLink } from "./ButtonLink";

describe("ButtonLink", () => {
  it("renders a TanStack link with button visuals", async () => {
    await renderButtonLink(
      <ButtonLink
        iconRight={<span aria-hidden="true">Right icon</span>}
        to={appRoutes.listTopics.path}
      >
        Back to topics
      </ButtonLink>
    );

    const link = screen.getByRole("link", { name: "Back to topics" });

    expect(link).toHaveAttribute("data-slot", "button-link");
    expect(link).toHaveAttribute("href", "/topics");
    expect(screen.getByText("Right icon")).toBeInTheDocument();
  });

  it("disables navigation while loading", async () => {
    await renderButtonLink(
      <ButtonLink
        isLoading
        loadingLabel="Loading topics..."
        to={appRoutes.listTopics.path}
      >
        Back to topics
      </ButtonLink>
    );

    const link = screen.getByRole("link", { name: "Loading topics..." });

    expect(link).toHaveAttribute("aria-busy", "true");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).not.toHaveAttribute("href");
  });

  it("keeps route params typed", () => {
    const validTopicDetailsLink = (
      <ButtonLink
        params={{ topicId: "topic-1", topicTitle: "Iran strike risk" }}
        to={appRoutes.topicDetails.path}
      >
        Topic details
      </ButtonLink>
    );

    const invalidTopicDetailsLink = (
      <ButtonLink
        // @ts-expect-error topicTitle is required by the topic details route.
        params={{ topicId: "topic-1" }}
        to={appRoutes.topicDetails.path}
      >
        Topic details
      </ButtonLink>
    );

    expect(validTopicDetailsLink).toBeTruthy();
    expect(invalidTopicDetailsLink).toBeTruthy();
  });
});

async function renderButtonLink(ui: ReactNode) {
  const rootRoute = createRootRoute({
    component: () => ui
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
  const topicDetailsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: appRoutes.topicDetails.path,
    component: EmptyRouteComponent
  });
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: [appRoutes.home.path] }),
    routeTree: rootRoute.addChildren([
      homeRoute,
      listTopicsRoute,
      topicDetailsRoute
    ])
  });

  const renderResult = render(<RouterProvider router={router} />);
  await screen.findByRole("link");

  return renderResult;
}

function EmptyRouteComponent() {
  return null;
}
