import { fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import {
  FormProvider as ReactHookFormProvider,
  useForm,
  useWatch
} from "react-hook-form";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { FormProvider } from "@repo/ui-base";

import { FormTextarea } from "./FormTextarea";

type ExampleFormValues = {
  notes: string;
};

function FormTextareaHarness({ setError = false }: { setError?: boolean }) {
  const form = useForm<ExampleFormValues>({
    defaultValues: {
      notes: "Initial note"
    }
  });
  const notes = useWatch({ control: form.control, name: "notes" });

  useEffect(() => {
    if (setError) {
      form.setError("notes", { message: "Notes are required." });
    }
  }, [form, setError]);

  return (
    <ReactHookFormProvider {...form}>
      <FormTextarea<ExampleFormValues>
        description="Use a concise note."
        label="Notes"
        name="notes"
        placeholder="Enter notes"
      />
      <p aria-label="Current notes">{notes}</p>
    </ReactHookFormProvider>
  );
}

describe("FormTextarea", () => {
  it("connects a local textarea to react-hook-form state", () => {
    render(<FormTextareaHarness />);

    const textarea = screen.getByLabelText("Notes");

    expect(textarea).toHaveValue("Initial note");
    expect(textarea.id).toMatch(/^textarea-/);

    fireEvent.change(textarea, { target: { value: "Updated note" } });

    expect(screen.getByLabelText("Current notes")).toHaveTextContent(
      "Updated note"
    );
  });

  it("renders field errors from react-hook-form", async () => {
    render(<FormTextareaHarness setError />);

    const error = await screen.findByText("Notes are required.");
    const textarea = screen.getByLabelText("Notes");

    expect(error).toHaveAttribute("id", `${textarea.id}-error`);
    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });

  it("marks schema-required fields as required", () => {
    const schema = z.object({
      notes: z.string().min(1, "Notes are required."),
      optionalNotes: z.string().optional()
    });

    type SchemaFormValues = z.input<typeof schema>;

    render(
      <FormProvider
        defaultValues={{ notes: "Initial note", optionalNotes: "" }}
        schema={schema}
      >
        <FormTextarea<SchemaFormValues> label="Notes" name="notes" />
        <FormTextarea<SchemaFormValues>
          label="Optional notes"
          name="optionalNotes"
        />
      </FormProvider>
    );

    expect(screen.getByLabelText("Notes")).toBeRequired();
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.getByLabelText("Optional notes")).not.toBeRequired();
  });
});
