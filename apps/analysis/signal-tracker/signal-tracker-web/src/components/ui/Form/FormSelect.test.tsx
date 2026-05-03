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

import { FormSelect } from "./FormSelect";

const options = [
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" }
];

type ExampleFormValues = {
  status: string;
};

function FormSelectHarness({ setError = false }: { setError?: boolean }) {
  const form = useForm<ExampleFormValues>({
    defaultValues: {
      status: "draft"
    }
  });
  const status = useWatch({ control: form.control, name: "status" });

  useEffect(() => {
    if (setError) {
      form.setError("status", { message: "Status is required." });
    }
  }, [form, setError]);

  return (
    <ReactHookFormProvider {...form}>
      <FormSelect<ExampleFormValues>
        description="Choose the current status."
        label="Status"
        name="status"
        options={options}
        placeholder="Choose status"
      />
      <p aria-label="Current status">{status}</p>
    </ReactHookFormProvider>
  );
}

describe("FormSelect", () => {
  it("connects a local select to react-hook-form state", () => {
    render(<FormSelectHarness />);

    const select = screen.getByLabelText("Status");

    expect(select).toHaveValue("draft");
    expect(select.id).toMatch(/^select-/);

    fireEvent.change(select, { target: { value: "active" } });

    expect(screen.getByLabelText("Current status")).toHaveTextContent("active");
  });

  it("renders field errors from react-hook-form", async () => {
    render(<FormSelectHarness setError />);

    const error = await screen.findByText("Status is required.");
    const select = screen.getByLabelText("Status");

    expect(error).toHaveAttribute("id", `${select.id}-error`);
    expect(select).toHaveAttribute("aria-invalid", "true");
  });

  it("marks schema-required fields as required", () => {
    const schema = z.object({
      optionalStatus: z.string().optional(),
      status: z.string().min(1, "Status is required.")
    });

    type SchemaFormValues = z.input<typeof schema>;

    render(
      <FormProvider
        defaultValues={{ optionalStatus: "", status: "draft" }}
        schema={schema}
      >
        <FormSelect<SchemaFormValues>
          label="Status"
          name="status"
          options={options}
        />
        <FormSelect<SchemaFormValues>
          label="Optional status"
          name="optionalStatus"
          options={options}
        />
      </FormProvider>
    );

    expect(screen.getByLabelText("Status")).toBeRequired();
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.getByLabelText("Optional status")).not.toBeRequired();
  });
});
