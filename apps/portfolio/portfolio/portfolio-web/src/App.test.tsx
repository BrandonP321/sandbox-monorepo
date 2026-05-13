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
    expect(screen.getByRole("navigation")).toHaveAccessibleName(
      "Portfolio sections"
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "Experience" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Projects" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Writing" })
    ).toBeInTheDocument();
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
