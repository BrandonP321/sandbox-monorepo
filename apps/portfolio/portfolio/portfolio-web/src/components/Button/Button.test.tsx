import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("renders button children", () => {
    render(<Button>Contact</Button>);

    expect(screen.getByRole("button", { name: "Contact" })).toBeInTheDocument();
  });

  it("defaults to a non-submit button type", () => {
    render(<Button>Contact</Button>);

    expect(screen.getByRole("button", { name: "Contact" })).toHaveAttribute(
      "type",
      "button"
    );
  });

  it("supports disabled button state", () => {
    render(<Button disabled>Contact</Button>);

    expect(screen.getByRole("button", { name: "Contact" })).toBeDisabled();
  });
});
