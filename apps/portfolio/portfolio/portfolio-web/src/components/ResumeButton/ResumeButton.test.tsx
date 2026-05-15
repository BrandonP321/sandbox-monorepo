import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ResumeButton } from "./ResumeButton";

describe("ResumeButton", () => {
  it("links to the bundled resume PDF", () => {
    render(<ResumeButton />);

    const resumeLink = screen.getByRole("link", { name: "Resume" });

    expect(resumeLink).toHaveAttribute(
      "href",
      expect.stringContaining("resume.pdf")
    );
    expect(resumeLink).toHaveAttribute("target", "_blank");
    expect(resumeLink).toHaveAttribute("rel", "noreferrer");
  });

  it("supports the shared glass button variants", () => {
    render(<ResumeButton variant="secondary" />);

    expect(screen.getByRole("link", { name: "Resume" })).toHaveClass(
      "portfolio-glass-button--secondary"
    );
  });
});
