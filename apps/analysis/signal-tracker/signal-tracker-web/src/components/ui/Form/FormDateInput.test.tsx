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

import { FormDateInput } from "./FormDateInput";

type ExampleFormValues = {
  assessmentDate: string;
};

function FormDateInputHarness({ setError = false }: { setError?: boolean }) {
  const form = useForm<ExampleFormValues>({
    defaultValues: {
      assessmentDate: "2026-05-05"
    }
  });
  const assessmentDate = useWatch({
    control: form.control,
    name: "assessmentDate"
  });

  useEffect(() => {
    if (setError) {
      form.setError("assessmentDate", {
        message: "Assessment date is required."
      });
    }
  }, [form, setError]);

  return (
    <ReactHookFormProvider {...form}>
      <FormDateInput<ExampleFormValues>
        description="Use the date of the assessment."
        label="Assessment date"
        max="2026-12-31"
        min="2026-01-01"
        name="assessmentDate"
      />
      <p aria-label="Current assessment date">{assessmentDate}</p>
    </ReactHookFormProvider>
  );
}

describe("FormDateInput", () => {
  it("connects a local date input to react-hook-form state", () => {
    render(<FormDateInputHarness />);

    const input = screen.getByLabelText("Assessment date");

    expect(input).toHaveValue("2026-05-05");
    expect(input).toHaveAttribute("min", "2026-01-01");
    expect(input).toHaveAttribute("max", "2026-12-31");

    fireEvent.change(input, { target: { value: "2026-05-06" } });

    expect(screen.getByLabelText("Current assessment date")).toHaveTextContent(
      "2026-05-06"
    );
  });

  it("renders field errors from react-hook-form", async () => {
    render(<FormDateInputHarness setError />);

    const error = await screen.findByText("Assessment date is required.");
    const input = screen.getByLabelText("Assessment date");

    expect(error).toBeInTheDocument();
    expect(input).toHaveAccessibleDescription(
      "Use the date of the assessment. Assessment date is required."
    );
    expect(input).toBeInvalid();
  });

  it("marks schema-required date fields as required", () => {
    const schema = z.object({
      assessmentDate: z.string().min(1, "Assessment date is required."),
      targetResolutionDate: z.string().optional()
    });

    type SchemaFormValues = z.input<typeof schema>;

    render(
      <FormProvider
        defaultValues={{
          assessmentDate: "2026-05-05",
          targetResolutionDate: ""
        }}
        schema={schema}
      >
        <FormDateInput<SchemaFormValues>
          label="Assessment date"
          name="assessmentDate"
        />
        <FormDateInput<SchemaFormValues>
          label="Target resolution date"
          name="targetResolutionDate"
        />
      </FormProvider>
    );

    expect(screen.getByLabelText("Assessment date")).toBeRequired();
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.getByLabelText("Target resolution date")).not.toBeRequired();
  });

  it("keeps field names scoped to string form values", () => {
    type StrictFormValues = {
      assessmentDate: string;
      probabilityPct?: number;
    };
    type FormDateInputName = Parameters<
      typeof FormDateInput<StrictFormValues>
    >[0]["name"];

    const validName = "assessmentDate" satisfies FormDateInputName;
    // @ts-expect-error FormDateInput only accepts string-backed field names.
    const invalidName = "probabilityPct" satisfies FormDateInputName;

    expect(validName).toBe("assessmentDate");
    expect(invalidName).toBe("probabilityPct");
  });
});
