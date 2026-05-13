import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@repo/dashboard-ui";
import { ResourceNotFound } from "./ResourceNotFound";

describe("ResourceNotFound", () => {
  it("renders default resource not-found copy without an eyebrow", () => {
    render(<ResourceNotFound />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Resource not found" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Sorry, we couldn't find the resource you're looking for."
      )
    ).toBeInTheDocument();
    expect(screen.queryByText("404")).not.toBeInTheDocument();
  });

  it("renders custom copy and actions", () => {
    render(
      <ResourceNotFound
        actions={<Button>Back to topics</Button>}
        description="The topic you opened no longer exists."
        eyebrow="Missing topic"
        title="Topic not found"
      />
    );

    expect(screen.getByText("Missing topic")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Topic not found" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("The topic you opened no longer exists.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Back to topics" })
    ).toBeInTheDocument();
  });
});
