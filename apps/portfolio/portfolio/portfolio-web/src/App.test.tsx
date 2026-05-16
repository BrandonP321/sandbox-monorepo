import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "./App";

const placeholderDescription =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin euismod at ipsum sed sodales. Aliquam dapibus faucibus libero, eget ultricies nibh. Proin lorem augue, gravida at interdum at, varius vel mauris.";

describe("App", () => {
  it("renders the portfolio landing scaffold", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Brandon Phillips"
      })
    ).toBeInTheDocument();
    expect(screen.getAllByText(placeholderDescription).length).toBeGreaterThan(
      0
    );
    const nav = screen.getByRole("navigation", { name: "Portfolio sections" });

    expect(nav).toBeInTheDocument();
    expect(
      within(nav).getByRole("link", { name: "Experience" })
    ).toHaveAttribute("href", "#experience");
    expect(within(nav).getByRole("link", { name: "Project" })).toHaveAttribute(
      "href",
      "#latest-project"
    );
    expect(within(nav).getByRole("link", { name: "Resume" })).toHaveAttribute(
      "href",
      expect.stringContaining("resume.pdf")
    );
    expect(within(nav).getByRole("link", { name: "Resume" })).toHaveAttribute(
      "target",
      "_blank"
    );
    expect(within(nav).getByRole("link", { name: "Resume" })).toHaveAttribute(
      "rel",
      "noreferrer"
    );
    expect(document.getElementById("intro")).toBeInTheDocument();
    expect(document.getElementById("experience")).toBeInTheDocument();
    expect(document.getElementById("latest-project")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute(
      "data-slot",
      "portfolio-scroll-container"
    );
    expect(
      screen.getByRole("region", { name: "Experience" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Signal Tracker" })
    ).toBeInTheDocument();
    expect(screen.getByText("Latest personal project")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Software Development Engineer - AWS"
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "AI-Orchestrated Workflow"
      })
    ).toBeInTheDocument();
  });

  it("sets page metadata through ui-base", () => {
    render(<App />);

    expect(document.title).toBe("Portfolio | Brandon Phillips");
    expect(
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content")
    ).toBe("Portfolio for Brandon Phillips: experience and projects.");
  });
});
