import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Input } from "./Input";

describe("Input", () => {
  it("renders an editable textbox by default", () => {
    const handleChange = vi.fn();

    render(
      <>
        <label htmlFor="title">Title</label>
        <Input id="title" onChange={handleChange} />
      </>
    );

    const input = screen.getByRole("textbox", { name: "Title" });

    fireEvent.change(input, { target: { value: "Updated title" } });

    expect(input).toHaveValue("Updated title");
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("works as a labeled required field with validation state", () => {
    render(
      <>
        <label htmlFor="title">Title</label>
        <Input
          aria-describedby="title-error"
          aria-invalid
          id="title"
          onChange={() => {}}
          required
          value="Draft"
        />
        <p id="title-error">Title is required.</p>
      </>
    );

    const input = screen.getByRole("textbox", { name: "Title" });

    expect(input).toHaveAccessibleDescription("Title is required.");
    expect(input).toBeRequired();
    expect(input).toBeInvalid();
  });
});
