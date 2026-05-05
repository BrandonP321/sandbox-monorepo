import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContentHeader } from "./ContentHeader";

describe("ContentHeader", () => {
  it("renders the title, eyebrow, description, and actions", () => {
    render(
      <ContentHeader
        actions={<button type="button">Create topic</button>}
        description="Scan active dossiers and open one topic workspace at a time."
        eyebrow="Signal Tracker"
        headingLevel={1}
        title="Topics"
      />
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Topics" })
    ).toBeInTheDocument();
    expect(screen.getByText("Signal Tracker")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Scan active dossiers and open one topic workspace at a time."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create topic" })
    ).toBeInTheDocument();
  });

  it("uses the requested heading level", () => {
    render(<ContentHeader headingLevel={3} title="Container heading" />);

    expect(
      screen.getByRole("heading", { level: 3, name: "Container heading" })
    ).toBeInTheDocument();
  });
});
