import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider
} from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { Breadcrumbs, type BreadcrumbsItem } from "./Breadcrumbs";

const breadcrumbItems = [
  {
    icon: <svg aria-hidden="true" />,
    id: "home",
    title: "Home",
    to: "/"
  },
  {
    icon: <svg aria-hidden="true" />,
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
] satisfies BreadcrumbsItem[];

describe("Breadcrumbs", () => {
  it("renders breadcrumb items as links", async () => {
    await renderBreadcrumbs(<Breadcrumbs items={breadcrumbItems} />);

    const breadcrumbs = screen.getByRole("navigation", {
      name: "Breadcrumbs"
    });
    const homeLink = within(breadcrumbs).getByRole("link", { name: "Home" });
    const projectsLink = within(breadcrumbs).getByRole("link", {
      name: "Projects"
    });
    const projectLink = within(breadcrumbs).getByRole("link", {
      name: "Project Nero"
    });

    expect(homeLink).toHaveAttribute("href", "/");
    expect(homeLink).not.toHaveTextContent("Home");
    expect(homeLink.querySelector("svg")).toBeInTheDocument();
    expect(projectsLink).toHaveAttribute("href", "/projects");
    expect(projectsLink.querySelector("svg")).not.toBeInTheDocument();
    expect(projectLink).toHaveAttribute("href", "/projects/project-nero");
    expect(projectLink).toHaveAttribute("aria-current", "page");
  });

  it("truncates long visible labels while preserving the accessible link name", async () => {
    const longTitle = "Project Nero with additional geopolitical context";

    await renderBreadcrumbs(
      <Breadcrumbs
        items={[
          {
            id: "project-nero",
            params: { projectId: "project-nero" },
            title: longTitle,
            to: "/projects/$projectId"
          }
        ]}
        maxBreadcrumbLength={15}
      />
    );

    const projectLink = screen.getByRole("link", { name: longTitle });

    expect(projectLink).toHaveTextContent("Project Nero...");
    expect(projectLink).toHaveAttribute("title", longTitle);
  });

  it("adds a non-link collapsed middle indicator for narrow containers", async () => {
    const { container } = await renderBreadcrumbs(
      <Breadcrumbs items={breadcrumbItems} />
    );

    const breadcrumbs = screen.getByRole("navigation", {
      name: "Breadcrumbs"
    });
    const collapsedIndicator = container.querySelector(
      '[data-slot="breadcrumbs-collapsed-ellipsis"]'
    );
    const middleItem = within(breadcrumbs)
      .getByRole("link", { name: "Projects" })
      .closest("li");

    expect(collapsedIndicator).toHaveTextContent("...");
    expect(collapsedIndicator).toHaveAttribute("aria-hidden", "true");
    expect(within(breadcrumbs).queryByRole("link", { name: "..." })).toBeNull();
    expect(middleItem?.className).toContain("hidden");
    expect(middleItem?.className).toContain(
      "[@container(min-width:32rem)]:flex"
    );
  });

  it("does not render a collapsed indicator for shallow breadcrumb trails", async () => {
    const { container } = await renderBreadcrumbs(
      <Breadcrumbs items={breadcrumbItems.slice(0, 2)} />
    );

    expect(
      container.querySelector('[data-slot="breadcrumbs-collapsed-ellipsis"]')
    ).not.toBeInTheDocument();
  });
});

async function renderBreadcrumbs(ui: ReactNode) {
  const rootRoute = createRootRoute({
    component: () => ui
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
  const router = createRouter({
    history: createMemoryHistory({
      initialEntries: ["/projects/project-nero"]
    }),
    routeTree: rootRoute.addChildren([homeRoute, projectsRoute, projectRoute])
  });

  const renderResult = render(<RouterProvider router={router} />);
  await screen.findByRole("navigation", { name: "Breadcrumbs" });

  return renderResult;
}

function EmptyRouteComponent() {
  return null;
}
