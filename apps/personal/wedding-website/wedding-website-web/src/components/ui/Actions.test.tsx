import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button, PrimaryLink, QuietLink } from "./Actions";

describe("Button", () => {
  it("defaults to a non-submitting primary button", () => {
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Continue</Button>);

    const button = screen.getByRole("button", { name: "Continue" });

    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("data-variant", "primary");

    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("preserves native button behavior and the quiet variant", () => {
    const handleClick = vi.fn();

    render(
      <Button disabled onClick={handleClick} type="submit" variant="quiet">
        Back
      </Button>
    );

    const button = screen.getByRole("button", { name: "Back" });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveAttribute("data-variant", "quiet");

    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });
});

describe("QuietLink", () => {
  it("retains native link semantics", () => {
    render(<QuietLink href="#details">View details</QuietLink>);

    expect(screen.getByRole("link", { name: "View details" })).toHaveAttribute(
      "href",
      "#details"
    );
  });
});

describe("PrimaryLink", () => {
  it("combines native link semantics with primary action styling", () => {
    render(<PrimaryLink href="/RSVP">RSVP</PrimaryLink>);

    const link = screen.getByRole("link", { name: "RSVP" });
    expect(link).toHaveAttribute("href", "/RSVP");
    expect(link).toHaveAttribute("data-variant", "primary");
  });
});
