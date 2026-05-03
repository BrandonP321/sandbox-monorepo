import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Input } from "./Input";

describe("Input", () => {
  it("renders a text input with default styling", () => {
    render(<Input placeholder="Title" />);

    const input = screen.getByPlaceholderText("Title");

    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveClass("border-input");
    expect(input).toHaveClass("bg-background");
    expect(input).toHaveClass("rounded-md");
  });

  it("supports narrow native input props", () => {
    const handleChange = vi.fn();

    render(
      <Input
        aria-describedby="title-error"
        aria-invalid
        id="title"
        name="title"
        onChange={handleChange}
        placeholder="Title"
        required
        value="Draft"
      />
    );

    const input = screen.getByPlaceholderText("Title");

    fireEvent.change(input, { target: { value: "Updated" } });

    expect(input).toHaveAttribute("aria-describedby", "title-error");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("id", "title");
    expect(input).toHaveAttribute("name", "title");
    expect(input).toBeRequired();
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("merges caller classes with the input treatment", () => {
    render(<Input className="h-10 rounded-lg" placeholder="Merged" />);

    const input = screen.getByPlaceholderText("Merged");

    expect(input).toHaveClass("border-input");
    expect(input).toHaveClass("h-10");
    expect(input).toHaveClass("rounded-lg");
    expect(input).not.toHaveClass("h-9");
    expect(input).not.toHaveClass("rounded-md");
  });
});
