import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "./App";

describe("App", () => {
  it("renders the portfolio landing scaffold", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Brandon Phillips"
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Built to capture ideas instantly, connect insights intelligently, and clarify complex thinking, Reflect transforms the way you work with information."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Portfolio sections" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Intro" })).toHaveAttribute(
      "href",
      "#intro"
    );
    expect(screen.getByRole("link", { name: "Experience" })).toHaveAttribute(
      "href",
      "#experience"
    );
    expect(document.getElementById("intro")).toBeInTheDocument();
    expect(document.getElementById("experience")).toBeInTheDocument();
    expect(document.getElementById("preview-1-projects")).toBeInTheDocument();
    expect(document.getElementById("preview-1-writing")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute(
      "data-slot",
      "portfolio-scroll-container"
    );
    expect(
      screen.getByRole("region", { name: "Portfolio preview content" })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("region", { name: /^Portfolio preview content/ })
    ).toHaveLength(1);
    expect(
      screen.getByRole("region", { name: "Experience" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Software Development Engineer - AWS"
      })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("heading", { level: 2, name: "Below the fold" })
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("heading", { level: 3, name: "Projects" })
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("heading", { level: 3, name: "Writing" })
    ).toHaveLength(1);
    expect(
      screen.getAllByText(
        "Temporary content for reviewing how the hero graphic reveals itself while scrolling."
      )
    ).toHaveLength(1);
  });

  it("sets page metadata through ui-base", () => {
    render(<App />);

    expect(document.title).toBe("Portfolio | Brandon Phillips");
    expect(
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content")
    ).toBe(
      "Portfolio for Brandon Phillips: experience, projects, and writing."
    );
  });
});
