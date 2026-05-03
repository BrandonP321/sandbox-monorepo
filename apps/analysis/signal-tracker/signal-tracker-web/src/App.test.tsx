import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "./App";

describe("App", () => {
  it("renders the final Signal Tracker shell and primary surfaces", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Signal Tracker" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "View Topics" })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Topic Details" }).length
    ).toBeGreaterThan(0);

    fireEvent.click(
      screen.getAllByRole("button", { name: "Topic Details" })[0]
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Topic Details" })
    ).toBeInTheDocument();
    expect(screen.getByText("Timeline workspace")).toBeInTheDocument();
  });

  it("does not render temporary backend scaffold copy", () => {
    render(<App />);

    expect(
      screen.queryByRole("button", { name: "Verify Button" })
    ).not.toBeInTheDocument();
    expect(screen.queryByText("UI foundation")).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "Tailwind CSS and the local shadcn-style Button are wired in."
      )
    ).not.toBeInTheDocument();
  });

  it("does not import the backend test scaffold from the production App entrypoint", () => {
    const appSource = readFileSync(
      resolve(process.cwd(), "src/App.tsx"),
      "utf8"
    );

    expect(appSource).not.toContain("backendTestScaffold");
    expect(appSource).not.toContain("TempApp");
  });
});
