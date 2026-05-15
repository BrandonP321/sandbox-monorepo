import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LinkedInButton } from "./LinkedInButton";

describe("LinkedInButton", () => {
  it("links to the LinkedIn profile", () => {
    render(<LinkedInButton />);

    const linkedInLink = screen.getByRole("link", { name: "LinkedIn" });

    expect(linkedInLink).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/brandon-phillips-dev"
    );
    expect(linkedInLink).toHaveAttribute("target", "_blank");
    expect(linkedInLink).toHaveAttribute("rel", "noreferrer");
  });

  it("supports the shared glass button variants", () => {
    render(<LinkedInButton variant="secondary" />);

    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveClass(
      "portfolio-glass-button--secondary"
    );
  });

  it("supports the shared glass button size", () => {
    render(<LinkedInButton size="large" />);

    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveClass(
      "portfolio-glass-button--large"
    );
  });
});
