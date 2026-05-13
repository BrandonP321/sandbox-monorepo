import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card, CardContent, CardFooter, CardHeader } from "./Card";

describe("Card", () => {
  it("renders header, content, and footer content together", () => {
    render(
      <Card>
        <CardHeader>Header</CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );

    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });
});
