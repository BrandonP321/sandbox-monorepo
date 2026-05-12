import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import {
  FormProvider as ReactHookFormProvider,
  useForm,
  useWatch
} from "react-hook-form";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { FormProvider } from "../FormProvider";
import { FormNumberInput } from "./FormNumberInput";

type ExampleFormValues = {
  probabilityPct?: number;
};

function FormNumberInputHarness({ setError = false }: { setError?: boolean }) {
  const form = useForm<ExampleFormValues>({
    defaultValues: {
      probabilityPct: 10
    }
  });
  const probabilityPct = useWatch({
    control: form.control,
    name: "probabilityPct"
  });

  useEffect(() => {
    if (setError) {
      form.setError("probabilityPct", {
        message: "Probability is required."
      });
    }
  }, [form, setError]);

  return (
    <ReactHookFormProvider {...form}>
      <FormNumberInput<ExampleFormValues>
        description="Enter 0-100."
        label="Probability"
        max={100}
        min={0}
        name="probabilityPct"
        placeholder="0-100"
        step={1}
      />
      <p aria-label="Current probability">{probabilityPct ?? "<empty>"}</p>
    </ReactHookFormProvider>
  );
}

describe("FormNumberInput", () => {
  it("connects a local number input to react-hook-form state", async () => {
    render(<FormNumberInputHarness />);

    const input = screen.getByRole("spinbutton", { name: "Probability" });

    expect(input).toHaveValue(10);

    fireEvent.change(input, { target: { value: "35" } });

    await waitFor(() => {
      expect(screen.getByLabelText("Current probability")).toHaveTextContent(
        "35"
      );
    });

    expect(input).toHaveValue(35);
  });

  it("stores an empty number input as undefined", async () => {
    render(<FormNumberInputHarness />);

    const input = screen.getByRole("spinbutton", { name: "Probability" });

    fireEvent.change(input, { target: { value: "" } });

    await waitFor(() => {
      expect(screen.getByLabelText("Current probability")).toHaveTextContent(
        "<empty>"
      );
    });

    expect(input).toHaveValue(null);
  });

  it("renders field errors from react-hook-form", async () => {
    render(<FormNumberInputHarness setError />);

    const error = await screen.findByText("Probability is required.");
    const input = screen.getByRole("spinbutton", { name: "Probability" });

    expect(error).toBeInTheDocument();
    expect(input).toHaveAccessibleDescription(
      "Enter 0-100. Probability is required."
    );
    expect(input).toBeInvalid();
  });

  it("marks schema-required number fields as required", () => {
    const schema = z.object({
      optionalProbabilityPct: z.number().optional(),
      probabilityPct: z.number().min(0).max(100)
    });

    type SchemaFormValues = z.input<typeof schema>;

    render(
      <FormProvider
        defaultValues={{
          optionalProbabilityPct: undefined,
          probabilityPct: 10
        }}
        schema={schema}
      >
        <FormNumberInput<SchemaFormValues>
          label="Probability"
          name="probabilityPct"
        />
        <FormNumberInput<SchemaFormValues>
          label="Optional probability"
          name="optionalProbabilityPct"
        />
      </FormProvider>
    );

    const probabilityInput = screen.getByRole("spinbutton", {
      name: "Probability"
    });

    expect(probabilityInput).toBeRequired();
    expect(probabilityInput).toHaveAttribute("min", "0");
    expect(probabilityInput).toHaveAttribute("max", "100");
    expect(probabilityInput).toHaveAttribute("placeholder", "0-100");
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: "Optional probability" })
    ).not.toBeRequired();
  });

  it("allows props to override schema-derived numeric constraints", () => {
    const schema = z.object({
      probabilityPct: z.number().min(0).max(100).optional()
    });

    type SchemaFormValues = z.input<typeof schema>;

    render(
      <FormProvider defaultValues={{ probabilityPct: 50 }} schema={schema}>
        <FormNumberInput<SchemaFormValues>
          label="Probability"
          max={90}
          min={10}
          name="probabilityPct"
        />
      </FormProvider>
    );

    const input = screen.getByRole("spinbutton", { name: "Probability" });

    expect(input).toHaveAttribute("min", "10");
    expect(input).toHaveAttribute("max", "90");
    expect(input).toHaveAttribute("placeholder", "10-90");
  });

  it("keeps field names scoped to number form values", () => {
    type StrictFormValues = {
      probabilityPct?: number;
      title: string;
    };
    type FormNumberInputName = Parameters<
      typeof FormNumberInput<StrictFormValues>
    >[0]["name"];

    const validName = "probabilityPct" satisfies FormNumberInputName;
    // @ts-expect-error FormNumberInput only accepts number-backed field names.
    const invalidName = "title" satisfies FormNumberInputName;

    expect(validName).toBe("probabilityPct");
    expect(invalidName).toBe("title");
  });
});
