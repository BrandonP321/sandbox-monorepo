import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GithubButton } from "./GithubButton";

describe("GithubButton", () => {
  it("links to the GitHub profile", () => {
    render(<GithubButton />);

    const githubLink = screen.getByRole("link", { name: "GitHub" });

    expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/BrandonP321"
    );
    expect(githubLink).toHaveAttribute("target", "_blank");
    expect(githubLink).toHaveAttribute("rel", "noreferrer");
  });

  it("supports the shared glass button variants", () => {
    render(<GithubButton variant="secondary" />);

    expect(screen.getByRole("link", { name: "GitHub" })).toHaveClass(
      "portfolio-glass-button--secondary"
    );
  });

  it("supports the shared glass button size", () => {
    render(<GithubButton size="large" />);

    expect(screen.getByRole("link", { name: "GitHub" })).toHaveClass(
      "portfolio-glass-button--large"
    );
  });
});
