import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ActionsContainer } from "./ActionsContainer";

describe("ActionsContainer", () => {
  it("groups multiple actions in a wrapping container", () => {
    const { container } = render(
      <ActionsContainer aria-label="Profile actions" className="custom-actions">
        <a href="/resume.pdf">Resume</a>
        <a href="https://github.com/BrandonP321">GitHub</a>
      </ActionsContainer>
    );

    const actionsContainer = container.querySelector(
      '[data-slot="actions-container"]'
    );

    expect(actionsContainer).toHaveClass(
      "portfolio-actions-container",
      "custom-actions"
    );
    expect(actionsContainer).toHaveAttribute("aria-label", "Profile actions");
    expect(screen.getByRole("link", { name: "Resume" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "GitHub" })).toBeInTheDocument();
  });
});
