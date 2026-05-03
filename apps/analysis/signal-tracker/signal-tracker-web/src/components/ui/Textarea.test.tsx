import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("renders a textarea with default styling", () => {
    render(<Textarea placeholder="Notes" />);

    const textarea = screen.getByPlaceholderText("Notes");

    expect(textarea).toHaveAttribute("rows", "4");
    expect(textarea).toHaveClass("border-input");
    expect(textarea).toHaveClass("bg-background");
    expect(textarea).toHaveClass("rounded-md");
  });

  it("supports narrow native textarea props", () => {
    const handleChange = vi.fn();

    render(
      <Textarea
        aria-describedby="notes-error"
        aria-invalid
        id="notes"
        name="notes"
        onChange={handleChange}
        placeholder="Notes"
        required
        rows={6}
        value="Draft"
      />
    );

    const textarea = screen.getByPlaceholderText("Notes");

    fireEvent.change(textarea, { target: { value: "Updated" } });

    expect(textarea).toHaveAttribute("aria-describedby", "notes-error");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAttribute("id", "notes");
    expect(textarea).toHaveAttribute("name", "notes");
    expect(textarea).toHaveAttribute("rows", "6");
    expect(textarea).toBeRequired();
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("merges caller classes with the textarea treatment", () => {
    render(<Textarea className="min-h-32 rounded-lg" placeholder="Merged" />);

    const textarea = screen.getByPlaceholderText("Merged");

    expect(textarea).toHaveClass("border-input");
    expect(textarea).toHaveClass("min-h-32");
    expect(textarea).toHaveClass("rounded-lg");
    expect(textarea).not.toHaveClass("min-h-20");
    expect(textarea).not.toHaveClass("rounded-md");
  });
});
