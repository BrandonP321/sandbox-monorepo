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
    const dateProps = {
      type: "date",
      value: "2026-05-05"
    } satisfies TextInputProps;
    const passwordProps = {
      type: "password",
      value: "draft-password"
    } satisfies TextInputProps;
    // @ts-expect-error TextInput only accepts string values.
    const invalidProps: TextInputProps = { value: 35 };

    expect(dateProps.value).toBe("2026-05-05");
    expect(passwordProps.value).toBe("draft-password");
    expect(invalidProps.value).toBe(35);
  });
});
