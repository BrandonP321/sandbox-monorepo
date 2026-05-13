import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Input, type InputProps } from "./Input";

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

  it("uses native sizing overrides for date inputs", () => {
    render(
      <>
        <label htmlFor="assessment-date">Assessment date</label>
        <Input
          id="assessment-date"
          onChange={() => {}}
          type="date"
          value="2026-05-13"
        />
      </>
    );

    const input = screen.getByLabelText("Assessment date");

    expect(input).toHaveClass(
      "appearance-none",
      "block",
      "[inline-size:100%]",
      "[max-inline-size:100%]",
      "[min-inline-size:0]"
    );
    expect(input).not.toHaveClass("flex");
  });

  it("keeps value types scoped to the input type", () => {
    const dateProps = {
      type: "date",
      value: "2026-05-05"
    } satisfies InputProps;
    const textProps = { type: "text", value: "Draft" } satisfies InputProps;
    const numberProps = { type: "number", value: 35 } satisfies InputProps;
    const emptyNumberProps = {
      type: "number",
      value: ""
    } satisfies InputProps;
    // @ts-expect-error Text inputs only accept string values.
    const invalidTextProps: InputProps = { type: "text", value: 35 };
    // @ts-expect-error Number inputs only accept number or empty string values.
    const invalidNumberProps: InputProps = { type: "number", value: "35" };
    // @ts-expect-error Date inputs only accept string values.
    const invalidDateProps: InputProps = { type: "date", value: 35 };

    expect(dateProps.value).toBe("2026-05-05");
    expect(textProps.value).toBe("Draft");
    expect(numberProps.value).toBe(35);
    expect(emptyNumberProps.value).toBe("");
    expect(invalidTextProps.value).toBe(35);
    expect(invalidNumberProps.value).toBe("35");
    expect(invalidDateProps.value).toBe(35);
  });
});
