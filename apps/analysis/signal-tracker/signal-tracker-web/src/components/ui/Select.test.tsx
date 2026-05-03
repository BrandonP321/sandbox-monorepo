import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Select } from "./Select";

const options = [
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" }
];

describe("Select", () => {
  it("renders a select with default styling and options", () => {
    render(
      <Select
        onChange={() => {}}
        options={options}
        placeholder="Choose status"
        value=""
      />
    );

    const select = screen.getByDisplayValue("Choose status");

    expect(select).toHaveClass("border-input");
    expect(select).toHaveClass("bg-background");
    expect(select).toHaveClass("rounded-md");
    expect(screen.getByRole("option", { name: "Draft" })).toHaveValue("draft");
  });

  it("supports narrow native select props", () => {
    const handleChange = vi.fn();

    render(
      <Select
        aria-describedby="status-error"
        aria-invalid
        id="status"
        name="status"
        onChange={handleChange}
        options={options}
        required
        value="draft"
      />
    );

    const select = screen.getByDisplayValue("Draft");

    fireEvent.change(select, { target: { value: "active" } });

    expect(select).toHaveAttribute("aria-describedby", "status-error");
    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(select).toHaveAttribute("id", "status");
    expect(select).toHaveAttribute("name", "status");
    expect(select).toBeRequired();
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("merges caller classes with the select treatment", () => {
    render(
      <Select
        className="h-10 rounded-lg"
        onChange={() => {}}
        options={options}
        value=""
      />
    );

    const select = screen.getByRole("combobox");

    expect(select).toHaveClass("border-input");
    expect(select).toHaveClass("h-10");
    expect(select).toHaveClass("rounded-lg");
    expect(select).not.toHaveClass("h-9");
    expect(select).not.toHaveClass("rounded-md");
  });
});
