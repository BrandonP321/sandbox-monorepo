import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Stack } from "./Stack";

describe("Stack", () => {
  it("renders a vertical stack with the requested gap", () => {
    const { container } = render(
      <Stack gap="sm">
        <p>First</p>
        <p>Second</p>
      </Stack>
    );

    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="stack"]')).toHaveClass(
      "grid",
      "gap-2"
    );
  });
});
