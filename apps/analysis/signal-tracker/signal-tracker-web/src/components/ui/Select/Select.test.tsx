import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Select } from "./Select";

const options = [
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" }
];

describe("Select", () => {
  it("renders a selectable combobox with options", () => {
    render(
      <>
        <label htmlFor="status">Status</label>
        <Select
          id="status"
          onChange={() => {}}
          options={options}
          placeholder="Choose status"
          value=""
        />
      </>
    );

    const select = screen.getByRole("combobox", { name: "Status" });

    expect(select).toHaveValue("");
    expect(
      screen.getByRole("option", { name: "Choose status" })
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Draft" })).toHaveValue("draft");
  });

  it("updates value and preserves validation state", () => {
    const handleChange = vi.fn();

    render(
      <>
        <label htmlFor="status">Status</label>
        <Select
          aria-describedby="status-error"
          aria-invalid
          id="status"
          onChange={handleChange}
          options={options}
          required
        />
        <p id="status-error">Status is required.</p>
      </>
    );

    const select = screen.getByRole("combobox", { name: "Status" });

    fireEvent.change(select, { target: { value: "active" } });

    expect(select).toHaveAccessibleDescription("Status is required.");
    expect(select).toBeInvalid();
    expect(select).toBeRequired();
    expect(select).toHaveValue("active");
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
