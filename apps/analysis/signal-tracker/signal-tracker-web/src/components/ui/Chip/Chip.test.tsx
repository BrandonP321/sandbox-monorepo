import { FileText } from "lucide-react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Chip } from "./Chip";

describe("Chip", () => {
  it("renders chip content", () => {
    render(<Chip>Agency report</Chip>);

    expect(screen.getByText("Agency report")).toBeInTheDocument();
  });

  it("renders an optional leading icon", () => {
    render(
      <Chip iconLeft={<FileText aria-hidden="true" data-testid="chip-icon" />}>
        Agency report
      </Chip>
    );

    expect(screen.getByTestId("chip-icon")).toBeInTheDocument();
    expect(screen.getByText("Agency report")).toBeInTheDocument();
  });
});
