import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card, CardContent, CardFooter, CardHeader } from "./Card";

describe("Card", () => {
  it("renders the default card surface", () => {
    render(<Card>Card body</Card>);

    const card = screen.getByText("Card body");

    expect(card).toHaveClass("bg-card");
    expect(card).toHaveClass("text-card-foreground");
    expect(card).toHaveClass("border-border");
    expect(card).toHaveClass("rounded-lg");
  });

  it("renders header, content, and footer regions", () => {
    render(
      <Card>
        <CardHeader>Header</CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );

    expect(screen.getByText("Header")).toHaveAttribute(
      "data-slot",
      "card-header"
    );
    expect(screen.getByText("Content")).toHaveAttribute(
      "data-slot",
      "card-content"
    );
    expect(screen.getByText("Footer")).toHaveAttribute(
      "data-slot",
      "card-footer"
    );
  });

  it("merges caller classes into each card region", () => {
    render(
      <Card className="w-80">
        <CardHeader className="p-3">Header</CardHeader>
        <CardContent className="px-3">Content</CardContent>
        <CardFooter className="justify-end">Footer</CardFooter>
      </Card>
    );

    expect(screen.getByText("Header").parentElement).toHaveClass("w-80");
    expect(screen.getByText("Header")).toHaveClass("p-3");
    expect(screen.getByText("Content")).toHaveClass("px-3");
    expect(screen.getByText("Footer")).toHaveClass("justify-end");
  });
});
