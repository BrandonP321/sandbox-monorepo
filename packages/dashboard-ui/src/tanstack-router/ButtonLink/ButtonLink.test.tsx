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

import { ButtonLink } from "./ButtonLink";

const testRoutes = {
  home: {
    path: "/"
  },
  listTopics: {
    path: "/topics"
  },
  topicDetails: {
    path: "/topics/$topicId/$topicTitle"
  }
} as const;

describe("ButtonLink", () => {
  it("renders a TanStack link with button visuals", async () => {
    await renderButtonLink(
      <ButtonLink
        iconRight={<span aria-hidden="true">Right icon</span>}
        to={testRoutes.listTopics.path}
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
        to={testRoutes.listTopics.path}
      >
        Back to topics
      </ButtonLink>
    );

    const link = screen.getByRole("link", { name: "Loading topics..." });

    expect(link).toHaveAttribute("aria-busy", "true");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).not.toHaveAttribute("href");
  });

  it("accepts route params for parameterized routes", () => {
    const topicDetailsLink = (
      <ButtonLink
        params={{ topicId: "topic-1", topicTitle: "Iran strike risk" }}
        to={testRoutes.topicDetails.path}
      >
        Topic details
      </ButtonLink>
    );

    expect(topicDetailsLink).toBeTruthy();
  });
});

async function renderButtonLink(ui: ReactNode) {
  const rootRoute = createRootRoute({
    component: () => ui
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
  const topicDetailsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: testRoutes.topicDetails.path,
    component: EmptyRouteComponent
  });
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: [testRoutes.home.path] }),
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
