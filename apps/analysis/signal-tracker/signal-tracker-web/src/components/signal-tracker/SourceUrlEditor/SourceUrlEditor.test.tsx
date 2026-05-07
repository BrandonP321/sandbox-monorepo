import { fireEvent, render, screen } from "@testing-library/react";
import { useWatch } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { FormProvider } from "@repo/ui-base";

import { Button, Form } from "@/components/ui";

import { SourceUrlEditor } from "./SourceUrlEditor";

const sourceUrlEditorSchema = z.object({
  sourceUrls: z.array(
    z.object({
      url: z.string().min(1, "Source URL is required.")
    })
  )
});

type SourceUrlEditorFormValues = z.input<typeof sourceUrlEditorSchema>;

describe("SourceUrlEditor", () => {
  it("renders URL rows with compact source preview chips", () => {
    render(
      <SourceUrlEditorHarness
        defaultValues={{
          sourceUrls: [
            { url: "https://agency.example/report" },
            { url: "https://www.reuters.com/world/example" }
          ]
        }}
      />
    );

    expect(screen.getByRole("textbox", { name: "Source URL 1" })).toHaveValue(
      "https://agency.example/report"
    );
    expect(screen.getByRole("textbox", { name: "Source URL 2" })).toHaveValue(
      "https://www.reuters.com/world/example"
    );
    expect(
      screen.getByLabelText("Source preview for agency.example")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Source preview for www.reuters.com")
    ).toBeInTheDocument();
  });

  it("adds and removes URL rows through react-hook-form field array state", () => {
    render(<SourceUrlEditorHarness defaultValues={{ sourceUrls: [] }} />);

    fireEvent.click(screen.getByRole("button", { name: "Add source" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Source URL 1" }), {
      target: { value: "https://wire.example/live" }
    });

    expect(screen.getByLabelText("Current source URLs")).toHaveTextContent(
      '[{"url":"https://wire.example/live"}]'
    );
    expect(
      screen.getByLabelText("Source preview for wire.example")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));

    expect(
      screen.queryByRole("textbox", { name: "Source URL 1" })
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Current source URLs")).toHaveTextContent(
      "[]"
    );
  });

  it("renders per-row validation errors from the active form provider", async () => {
    const handleSubmit = vi.fn();

    render(
      <FormProvider
        defaultValues={{ sourceUrls: [{ url: "" }] }}
        schema={sourceUrlEditorSchema}
      >
        <Form<SourceUrlEditorFormValues> onSubmit={handleSubmit}>
          <SourceUrlEditor<SourceUrlEditorFormValues> name="sourceUrls" />
          <Button type="submit">Submit</Button>
        </Form>
      </FormProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    const error = await screen.findByText("Source URL is required.");
    const input = screen.getByRole("textbox", { name: "Source URL 1" });

    expect(error).toBeInTheDocument();
    expect(input).toBeInvalid();
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});

function SourceUrlEditorHarness({
  defaultValues
}: {
  defaultValues: SourceUrlEditorFormValues;
}) {
  return (
    <FormProvider defaultValues={defaultValues} schema={sourceUrlEditorSchema}>
      <SourceUrlEditor<SourceUrlEditorFormValues> name="sourceUrls" />
      <CurrentSourceUrls />
    </FormProvider>
  );
}

function CurrentSourceUrls() {
  const sourceUrls = useWatch<SourceUrlEditorFormValues>({
    name: "sourceUrls"
  });

  return (
    <p aria-label="Current source URLs">{JSON.stringify(sourceUrls ?? [])}</p>
  );
}
