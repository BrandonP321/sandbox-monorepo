import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TextInput, type TextInputProps } from "./TextInput";

describe("TextInput", () => {
  it("renders a labeled text input", () => {
    const handleChange = vi.fn();

    render(
      <>
        <label htmlFor="title">Title</label>
        <TextInput id="title" onChange={handleChange} placeholder="Title" />
      </>
    );

    const input = screen.getByRole("textbox", { name: "Title" });

    fireEvent.change(input, { target: { value: "Updated title" } });

    expect(input).toHaveValue("Updated title");
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("supports string-valued input types without allowing number values", () => {
    const emailProps = {
      type: "email",
      value: "analyst@example.com"
    } satisfies TextInputProps;
    const passwordProps = {
      type: "password",
      value: "draft-password"
    } satisfies TextInputProps;
    // @ts-expect-error TextInput does not accept date inputs.
    const invalidDateProps: TextInputProps = { type: "date" };
    // @ts-expect-error TextInput only accepts string values.
    const invalidProps: TextInputProps = { value: 35 };

    expect(emailProps.value).toBe("analyst@example.com");
    expect(passwordProps.value).toBe("draft-password");
    expect(invalidDateProps.type).toBe("date");
    expect(invalidProps.value).toBe(35);
  });
});
