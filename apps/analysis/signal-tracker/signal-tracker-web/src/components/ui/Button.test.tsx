import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("renders button children by default", () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("renders a disabled busy state while loading", () => {
    render(
      <Button isLoading loadingLabel="Saving...">
        Save
      </Button>
    );

    const button = screen.getByRole("button", { name: "Saving..." });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });
});
