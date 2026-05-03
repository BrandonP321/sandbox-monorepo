import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("renders an editable textbox", () => {
    const handleChange = vi.fn();

    render(
      <>
        <label htmlFor="notes">Notes</label>
        <Textarea id="notes" onChange={handleChange} />
      </>
    );

    const textarea = screen.getByRole("textbox", { name: "Notes" });

    fireEvent.change(textarea, { target: { value: "Updated note" } });

    expect(textarea).toHaveValue("Updated note");
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("works as a labeled required field with validation state", () => {
    render(
      <>
        <label htmlFor="notes">Notes</label>
        <Textarea
          aria-describedby="notes-error"
          aria-invalid
          id="notes"
          onChange={() => {}}
          required
          rows={6}
          value="Draft"
        />
        <p id="notes-error">Notes are required.</p>
      </>
    );

    const textarea = screen.getByRole("textbox", { name: "Notes" });

    expect(textarea).toHaveAccessibleDescription("Notes are required.");
    expect(textarea).toHaveAttribute("rows", "6");
    expect(textarea).toBeRequired();
    expect(textarea).toBeInvalid();
  });
});
