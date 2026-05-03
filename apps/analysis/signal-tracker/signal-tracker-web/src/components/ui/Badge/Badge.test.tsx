import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders the default badge styling", () => {
    render(<Badge>Default</Badge>);

    const badge = screen.getByText("Default");

    expect(badge).toHaveClass("bg-primary");
    expect(badge).toHaveClass("text-primary-foreground");
    expect(badge).toHaveClass("rounded-md");
  });

  it("supports narrow variants", () => {
    render(<Badge variant="outline">Outline</Badge>);

    const badge = screen.getByText("Outline");

    expect(badge).toHaveClass("border-border");
    expect(badge).toHaveClass("bg-background");
    expect(badge).toHaveClass("text-foreground");
  });

  it("merges caller classes into the selected variant", () => {
    render(
      <Badge className="px-3 uppercase" variant="secondary">
        Merged
      </Badge>
    );

    const badge = screen.getByText("Merged");

    expect(badge).toHaveClass("bg-secondary");
    expect(badge).toHaveClass("text-secondary-foreground");
    expect(badge).toHaveClass("px-3");
    expect(badge).toHaveClass("uppercase");
  });
});
