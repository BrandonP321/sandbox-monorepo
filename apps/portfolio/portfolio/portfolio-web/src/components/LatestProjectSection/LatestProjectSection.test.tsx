import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LatestProjectSection } from "./LatestProjectSection";

describe("LatestProjectSection", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the Signal Tracker project structure inside a glass panel", () => {
    const { container } = render(<LatestProjectSection />);

    const section = screen.getByRole("region", {
      name: "Signal Tracker"
    });

    expect(section).toHaveAttribute("data-slot", "latest-project-section");
    expect(
      container.querySelector('[data-slot="glass-container"]')
    ).toBeInTheDocument();
    expect(
      within(section).getByText("Latest personal project")
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("heading", {
        level: 2,
        name: "Signal Tracker"
      })
    ).toBeInTheDocument();
    expect(
      within(section).getByText(
        "Placeholder introduction for the latest personal project, with room to describe why Signal Tracker is a useful proxy for professional work."
      )
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("link", { name: "Highlights" })
    ).toHaveAttribute("href", "#signal-tracker-workflow");
    expect(
      within(section).getByRole("link", { name: "Infrastructure" })
    ).toHaveAttribute("href", "#signal-tracker-infrastructure");
    expect(
      within(section).getByRole("heading", {
        level: 3,
        name: "Signal Tracker workflow"
      })
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("heading", {
        level: 3,
        name: "Composable app architecture"
      })
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("heading", {
        level: 3,
        name: "Production-style infrastructure"
      })
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("heading", {
        level: 3,
        name: "Evidence-first analysis"
      })
    ).toBeInTheDocument();
  });

  it("opens project details from card text links", () => {
    vi.useFakeTimers();
    render(<LatestProjectSection />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Read details for Signal Tracker workflow"
      })
    );

    expect(screen.getByRole("dialog")).toHaveAttribute("open");
    expect(
      within(screen.getByRole("dialog")).getByRole("heading", {
        level: 3,
        name: "Signal Tracker workflow"
      })
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("dialog")).getByText(
        "Longer placeholder detail for the product thinking, workflow design, and tradeoffs behind this highlight."
      )
    ).toBeInTheDocument();

    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Close Signal Tracker workflow details"
      })
    );

    expect(screen.getByRole("dialog")).toHaveAttribute("data-closing", "true");

    act(() => {
      vi.advanceTimersByTime(160);
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes project details when the overlay is clicked", () => {
    vi.useFakeTimers();
    render(<LatestProjectSection />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Read details for Signal Tracker workflow"
      })
    );

    fireEvent.click(screen.getByRole("dialog"));

    expect(screen.getByRole("dialog")).toHaveAttribute("data-closing", "true");

    act(() => {
      vi.advanceTimersByTime(160);
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
