import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NumberInput } from "./NumberInput";

describe("NumberInput", () => {
  it("renders a labeled number input with numeric constraints", () => {
    const handleChange = vi.fn();

    render(
      <>
        <label htmlFor="probability">Probability</label>
        <NumberInput
          id="probability"
          max={100}
          min={0}
          onChange={handleChange}
          step={1}
        />
      </>
    );

    const input = screen.getByRole("spinbutton", { name: "Probability" });

    fireEvent.change(input, { target: { value: "35" } });

    expect(input).toHaveValue(35);
    expect(input).toHaveAttribute("min", "0");
    expect(input).toHaveAttribute("max", "100");
    expect(input).toHaveAttribute("placeholder", "0-100");
    expect(input).toHaveAttribute("step", "1");
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("defaults one-sided numeric placeholders from constraints", () => {
    render(
      <>
        <label htmlFor="minimum">Minimum only</label>
        <NumberInput id="minimum" min={0} />
        <label htmlFor="maximum">Maximum only</label>
        <NumberInput id="maximum" max={100} />
      </>
    );

    expect(
      screen.getByRole("spinbutton", { name: "Minimum only" })
    ).toHaveAttribute("placeholder", "\u2265 0");
    expect(
      screen.getByRole("spinbutton", { name: "Maximum only" })
    ).toHaveAttribute("placeholder", "\u2264 100");
  });

  it("uses an explicit placeholder over numeric constraints", () => {
    render(
      <>
        <label htmlFor="probability">Probability</label>
        <NumberInput
          id="probability"
          max={100}
          min={0}
          placeholder="Custom placeholder"
        />
      </>
    );

    expect(
      screen.getByRole("spinbutton", { name: "Probability" })
    ).toHaveAttribute("placeholder", "Custom placeholder");
  });
});
