import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LatestProjectSection } from "./LatestProjectSection";

const projectDescription =
  "A full-stack web app for maintaining evidence-backed continuity on public-affairs topics—tracking what happened, what supports it, and how assessments change over time.";
const featureDescription =
  "Signal Tracker is designed for long-running issues where context, evidence, and judgment history matter more than another news feed.";
const engineeringDescription =
  "Signal Tracker is built as a modern TypeScript monorepo with shared contracts, reusable UI infrastructure, AWS-native deployment, and an AI-assisted development workflow.";

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
    expect(within(section).getByText(projectDescription)).toBeInTheDocument();
    expect(within(section).getByText(featureDescription)).toBeInTheDocument();
    expect(
      within(section).getByText(engineeringDescription)
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("link", { name: "Documentation" })
    ).toHaveAttribute(
      "href",
      "https://drive.google.com/drive/folders/16VAZNP9MZSc_yKdZP1shB3ofi0jhPF2e"
    );
    expect(
      within(section).getByRole("link", { name: "Documentation" })
    ).toHaveAttribute("target", "_blank");
    expect(
      within(section).getByRole("link", { name: "Documentation" })
    ).toHaveAttribute("rel", "noreferrer");
    expect(
      within(section).getByRole("link", { name: "Codebase" })
    ).toHaveAttribute(
      "href",
      "https://github.com/BrandonP321/sandbox-monorepo/tree/main/apps/analysis/signal-tracker"
    );
    expect(
      within(section).getByRole("link", { name: "Codebase" })
    ).toHaveAttribute("target", "_blank");
    expect(
      within(section).getByRole("link", { name: "Codebase" })
    ).toHaveAttribute("rel", "noreferrer");
    expect(
      within(section).getByRole("link", { name: "UI System" })
    ).toHaveAttribute("href", "https://d1m6bok2tskoqv.cloudfront.net/");
    expect(
      within(section).getByRole("link", { name: "UI System" })
    ).toHaveAttribute("target", "_blank");
    expect(
      within(section).getByRole("link", { name: "UI System" })
    ).toHaveAttribute("rel", "noreferrer");
    expect(
      within(section).getByRole("link", { name: "Live App" })
    ).toHaveAttribute("href", "https://d36eqszg4ubv0g.cloudfront.net/");
    expect(
      within(section).getByRole("link", { name: "Live App" })
    ).toHaveAttribute("target", "_blank");
    expect(
      within(section).getByRole("link", { name: "Live App" })
    ).toHaveAttribute("rel", "noreferrer");
    expect(
      within(section).getByRole("heading", {
        level: 3,
        name: "Engineering Highlights"
      })
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("heading", {
        level: 3,
        name: "AI-Orchestrated Workflow"
      })
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("heading", {
        level: 3,
        name: "Bone-DRY Full-Stack Contracts"
      })
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("heading", {
        level: 3,
        name: "Bone-DRY Frontend Platform"
      })
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("heading", {
        level: 3,
        name: "AWS-Native Delivery Stack"
      })
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("heading", {
        level: 3,
        name: "Product Features"
      })
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("heading", {
        level: 3,
        name: "Topic Dossiers"
      })
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("heading", {
        level: 3,
        name: "Evidence-Backed Entries"
      })
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("heading", {
        level: 3,
        name: "Living Assessments"
      })
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("heading", {
        level: 3,
        name: "Review & Provenance Workflow"
      })
    ).toBeInTheDocument();
  });

  it("opens project details from card text links", () => {
    vi.useFakeTimers();
    render(<LatestProjectSection />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Learn more for AI-Orchestrated Workflow"
      })
    );

    expect(screen.getByRole("dialog")).toHaveAttribute("open");
    expect(
      within(screen.getByRole("dialog")).getByRole("heading", {
        level: 3,
        name: "AI-Orchestrated Workflow"
      })
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("dialog")).getByRole("heading", {
        level: 4,
        name: "Workflow responsibilities"
      })
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("dialog")).getByText(
        "Google Drive remains the durable product source of truth."
      )
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("dialog")).getByText("Project Charter")
    ).toBeInTheDocument();

    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Close AI-Orchestrated Workflow details"
      })
    );

    expect(screen.getByRole("dialog")).toHaveAttribute("data-closing", "true");

    act(() => {
      vi.advanceTimersByTime(160);
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens feature details with structured modal content", () => {
    render(<LatestProjectSection />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Learn more for Topic Dossiers"
      })
    );

    expect(screen.getByRole("dialog")).toHaveAttribute("open");
    expect(
      within(screen.getByRole("dialog")).getByRole("heading", {
        level: 3,
        name: "Topic Dossiers"
      })
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("dialog")).getByRole("heading", {
        level: 4,
        name: "What the feature does"
      })
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("dialog")).getByText(
        "The portfolio modal should describe this as the product's organizing layer: every entry, source, assessment, and review exists inside a defined analytical workspace."
      )
    ).toBeInTheDocument();
  });

  it("closes project details when the overlay is clicked", () => {
    vi.useFakeTimers();
    render(<LatestProjectSection />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Learn more for AI-Orchestrated Workflow"
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
