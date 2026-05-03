import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormField } from "./FormField";
import { Input } from "./Input";

describe("FormField", () => {
  it("connects the label to the rendered control", () => {
    render(
      <FormField id="title" label="Title">
        {(fieldProps) => <Input {...fieldProps} onChange={() => {}} value="" />}
      </FormField>
    );

    expect(screen.getByLabelText("Title")).toHaveAttribute("id", "title");
  });

  it("generates a field id when one is not provided", () => {
    render(
      <FormField label="Generated title">
        {(fieldProps) => <Input {...fieldProps} onChange={() => {}} value="" />}
      </FormField>
    );

    expect(screen.getByLabelText("Generated title").id).toMatch(
      /^form-field-\d+$/
    );
  });

  it("connects description and error text to the rendered control", () => {
    render(
      <FormField
        description="Use a short title."
        error="Title is required."
        id="title"
        label="Title"
      >
        {(fieldProps) => <Input {...fieldProps} onChange={() => {}} value="" />}
      </FormField>
    );

    const input = screen.getByLabelText("Title");

    expect(input).toHaveAttribute(
      "aria-describedby",
      "title-description title-error"
    );
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Use a short title.")).toHaveAttribute(
      "id",
      "title-description"
    );
    expect(screen.getByText("Title is required.")).toHaveAttribute(
      "id",
      "title-error"
    );
  });

  it("merges caller classes into the field wrapper", () => {
    render(
      <FormField className="max-w-sm" id="title" label="Title">
        {(fieldProps) => <Input {...fieldProps} onChange={() => {}} value="" />}
      </FormField>
    );

    expect(screen.getByLabelText("Title").parentElement).toHaveClass(
      "max-w-sm"
    );
  });

  it("shows a required indicator when the field is required", () => {
    render(
      <FormField id="title" label="Title" required>
        {(fieldProps) => <Input {...fieldProps} onChange={() => {}} value="" />}
      </FormField>
    );

    expect(screen.getByText("Required")).toBeInTheDocument();
  });
});
