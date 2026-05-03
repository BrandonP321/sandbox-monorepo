import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import App from "./App";

vi.mock("@/api", () => {
  return {
    useListTopicsQuery: () => ({})
  };
});

describe("App", () => {
  it("renders the final Signal Tracker shell and primary surfaces", () => {
    renderApp();

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
    renderApp();

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
});

function renderApp() {
  return render(<App />);
}
