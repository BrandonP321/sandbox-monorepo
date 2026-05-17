import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ExperienceSection } from "./ExperienceSection";

const experienceDescription =
  "I’ve built frontend systems across Amazon, AWS, Bungie, and early-stage startup work—turning complex product requirements into scalable React and TypeScript experiences that improve workflows, reduce operational friction, and make teams more effective.";

describe("ExperienceSection", () => {
  it("renders a glass timeline item for each provided logo", () => {
    render(<ExperienceSection />);

    const section = screen.getByRole("region", { name: "Experience" });

    expect(section).toHaveAttribute("data-slot", "experience-section");
    expect(
      within(section).getByRole("heading", { level: 2, name: "Experience" })
    ).toBeInTheDocument();
    expect(
      within(section).getByText(experienceDescription)
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("link", { name: "Resume" })
    ).toHaveAttribute("href", expect.stringContaining("resume.pdf"));
    expect(
      within(section).getByRole("link", { name: "LinkedIn" })
    ).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/brandon-phillips-dev"
    );
    expect(
      within(section).getByRole("heading", {
        level: 3,
        name: "Frontend Engineer II — Amazon"
      })
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("heading", {
        level: 3,
        name: "Full Stack Engineer — Startup"
      })
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("heading", {
        level: 3,
        name: "Frontend Engineer — AWS"
      })
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("heading", {
        level: 3,
        name: "Web Developer — Bungie"
      })
    ).toBeInTheDocument();
    expect(within(section).getAllByRole("img")).toHaveLength(4);
    expect(within(section).getByAltText("AWS logo")).toBeInTheDocument();
    expect(within(section).getByAltText("Amazon logo")).toBeInTheDocument();
    expect(within(section).getByAltText("Bungie logo")).toBeInTheDocument();
    expect(within(section).getByAltText("Startup logo")).toBeInTheDocument();
  });

  it("uses the shared glass container surface", () => {
    const { container } = render(<ExperienceSection />);

    expect(
      container.querySelector('[data-slot="glass-container"]')
    ).toBeInTheDocument();
  });

  it("groups header actions in a wrapping actions container", () => {
    const { container } = render(<ExperienceSection />);

    expect(
      container.querySelector(
        '[data-slot="content-header-actions"] [data-slot="actions-container"]'
      )
    ).toBeInTheDocument();
  });
});
