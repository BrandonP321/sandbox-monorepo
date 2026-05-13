import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Inline } from "./Inline";

describe("Inline", () => {
  it("renders an action row with wrapping, alignment, and justification", () => {
    const { container } = render(
      <Inline align="center" gap="sm" justify="end">
        <button type="button">Add event</button>
        <button type="button">Settings</button>
      </Inline>
    );

    expect(
      screen.getByRole("button", { name: "Add event" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Settings" })
    ).toBeInTheDocument();
    expect(container.querySelector('[data-slot="inline"]')).toHaveClass(
      "flex-wrap",
      "items-center",
      "justify-end",
      "gap-2"
    );
  });
});
