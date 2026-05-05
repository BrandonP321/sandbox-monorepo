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

  it("renders optional left and right icons with the button label", () => {
    render(
      <Button
        iconLeft={<span aria-hidden="true">Left icon</span>}
        iconRight={<span aria-hidden="true">Right icon</span>}
      >
        Save
      </Button>
    );

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByText("Left icon")).toBeInTheDocument();
    expect(screen.getByText("Right icon")).toBeInTheDocument();
  });

  it("hides icons while rendering replacement loading text", () => {
    render(
      <Button
        iconLeft={<span>Left icon</span>}
        isLoading
        loadingLabel="Saving..."
      >
        Save
      </Button>
    );

    expect(
      screen.getByRole("button", { name: "Saving..." })
    ).toBeInTheDocument();
    expect(screen.queryByText("Left icon")).not.toBeInTheDocument();
  });
});
