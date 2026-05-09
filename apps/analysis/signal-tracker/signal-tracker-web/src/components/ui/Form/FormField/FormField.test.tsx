import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormField } from "./FormField";
import { TextInput } from "../Input";

describe("FormField", () => {
  it("connects the label to the rendered control", () => {
    render(
      <FormField label="Title">
        {(fieldProps) => (
          <TextInput {...fieldProps} onChange={() => {}} value="" />
        )}
      </FormField>
    );

    expect(screen.getByRole("textbox", { name: "Title" })).toBeInTheDocument();
  });

  it("connects description and error text to the rendered control", () => {
    render(
      <FormField
        description="Use a short title."
        error="Title is required."
        label="Title"
      >
        {(fieldProps) => (
          <TextInput {...fieldProps} onChange={() => {}} value="" />
        )}
      </FormField>
    );

    const input = screen.getByRole("textbox", { name: "Title" });

    expect(input).toHaveAccessibleDescription(
      "Use a short title. Title is required."
    );
    expect(input).toBeInvalid();
  });

  it("preserves explicit IDs for stable control references", () => {
    render(
      <FormField id="title" label="Title">
        {(fieldProps) => (
          <TextInput {...fieldProps} onChange={() => {}} value="" />
        )}
      </FormField>
    );

    const input = screen.getByLabelText("Title");

    expect(input).toHaveAttribute("id", "title");
  });

  it("shows a required indicator when the field is required", () => {
    render(
      <FormField id="title" label="Title" required>
        {(fieldProps) => (
          <TextInput {...fieldProps} onChange={() => {}} value="" />
        )}
      </FormField>
    );

    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("supports label styling overrides", () => {
    render(
      <FormField label="Title" labelClassName="font-normal">
        {(fieldProps) => (
          <TextInput {...fieldProps} onChange={() => {}} value="" />
        )}
      </FormField>
    );

    expect(screen.getByText("Title")).toHaveClass("font-normal");
  });
});
