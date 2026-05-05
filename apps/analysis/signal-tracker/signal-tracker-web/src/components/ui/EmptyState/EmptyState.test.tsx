import { render, screen } from "@testing-library/react";
import { FolderPlus } from "lucide-react";
import { describe, expect, it } from "vitest";

import { Button } from "../Button";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders title, description, and optional action", () => {
    const { container } = render(
      <EmptyState
        action={<Button>New topic</Button>}
        description="Get started by creating a new topic."
        icon={<FolderPlus />}
        title="No topics"
      />
    );

    expect(screen.getByText("No topics")).toBeInTheDocument();
    expect(
      screen.getByText("Get started by creating a new topic.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "New topic" })
    ).toBeInTheDocument();
    expect(
      container.querySelector("[data-slot='empty-state-icon']")
    ).toHaveAttribute("aria-hidden", "true");
  });
});
