import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AutoGrid } from "./AutoGrid";

describe("AutoGrid", () => {
  it("renders children with a controlled minimum column width", () => {
    const { container } = render(
      <AutoGrid minColumnWidth="md">
        <label>First field</label>
        <label>Second field</label>
      </AutoGrid>
    );

    expect(screen.getByText("First field")).toBeInTheDocument();
    expect(screen.getByText("Second field")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="auto-grid"]')).toHaveStyle({
      gridTemplateColumns: "repeat(auto-fit, minmax(min(16rem, 100%), 1fr))"
    });
  });

  it("supports an exact two-column form grid", () => {
    const { container } = render(
      <AutoGrid columns={2}>
        <label>First field</label>
        <label>Second field</label>
      </AutoGrid>
    );

    expect(screen.getByText("First field")).toBeInTheDocument();
    expect(screen.getByText("Second field")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="auto-grid"]')).toHaveStyle({
      gridTemplateColumns: "repeat(2, minmax(min(12rem, 100%), 1fr))"
    });
  });
});
