import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChoiceGroup, ChoiceRow, FormField, Textarea, TextInput } from ".";

describe("FormField", () => {
  it("connects its label, helper text, error, and required state", () => {
    render(
      <FormField
        description="Use an address you check regularly."
        error="Enter a valid email address."
        label="Email"
        required
      >
        {(fieldProps) => <TextInput {...fieldProps} type="email" />}
      </FormField>
    );

    const input = screen.getByRole("textbox", { name: "Email" });

    expect(input).toBeRequired();
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription(
      "Use an address you check regularly. Enter a valid email address."
    );
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("supports native textarea attributes", () => {
    render(
      <FormField label="Notes">
        {(fieldProps) => (
          <Textarea {...fieldProps} disabled placeholder="Optional" rows={5} />
        )}
      </FormField>
    );

    const textarea = screen.getByRole("textbox", { name: "Notes" });

    expect(textarea).toBeDisabled();
    expect(textarea).toHaveAttribute("placeholder", "Optional");
    expect(textarea).toHaveAttribute("rows", "5");
  });
});

describe("choice controls", () => {
  it("selects a native radio when the whole row is clicked", () => {
    render(
      <ChoiceGroup
        description="Choose one response."
        error="Select an attendance response."
        legend="Will you attend?"
      >
        <ChoiceRow label="Attending" name="attendance" value="attending" />
        <ChoiceRow
          label="Unable to attend"
          name="attendance"
          value="declined"
        />
      </ChoiceGroup>
    );

    const group = screen.getByRole("group", { name: "Will you attend?" });
    const attending = screen.getByRole("radio", { name: "Attending" });

    expect(group).toBeInvalid();
    expect(group).toHaveAccessibleDescription(
      "Choose one response. Select an attendance response."
    );
    expect(attending).not.toBeChecked();

    fireEvent.click(screen.getByText("Attending"));

    expect(attending).toBeChecked();
  });

  it("preserves disabled radio behavior", () => {
    render(
      <ChoiceRow disabled label="Not available" name="example" value="no" />
    );

    const radio = screen.getByRole("radio", { name: "Not available" });

    fireEvent.click(screen.getByText("Not available"));

    expect(radio).toBeDisabled();
    expect(radio).not.toBeChecked();
  });
});
