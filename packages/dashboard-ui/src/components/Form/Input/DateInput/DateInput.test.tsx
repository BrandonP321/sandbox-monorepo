import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DateInput, type DateInputProps } from "./DateInput";

describe("DateInput", () => {
  it("renders a labeled date input with date constraints", () => {
    const handleChange = vi.fn();

    render(
      <>
        <label htmlFor="assessment-date">Assessment date</label>
        <DateInput
          id="assessment-date"
          max="2026-12-31"
          min="2026-01-01"
          onChange={handleChange}
        />
      </>
    );

    const input = screen.getByLabelText("Assessment date");

    fireEvent.change(input, { target: { value: "2026-05-06" } });

    expect(input).toHaveValue("2026-05-06");
    expect(input).toHaveAttribute("min", "2026-01-01");
    expect(input).toHaveAttribute("max", "2026-12-31");
    expect(input).toHaveClass(
      "appearance-none",
      "block",
      "max-w-full",
      "min-w-0",
      "[inline-size:100%]",
      "[max-inline-size:100%]",
      "[min-inline-size:0]"
    );
    expect(input).not.toHaveClass("flex");
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("only accepts string date values", () => {
    const dateProps = {
      value: "2026-05-05"
    } satisfies DateInputProps;
    // @ts-expect-error DateInput fixes the input type internally.
    const invalidTypeProps: DateInputProps = { type: "text" };
    // @ts-expect-error DateInput only accepts string values.
    const invalidValueProps: DateInputProps = { value: 35 };

    expect(dateProps.value).toBe("2026-05-05");
    expect("type" in invalidTypeProps).toBe(true);
    expect(invalidValueProps.value).toBe(35);
  });
});
