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

import { FormInput } from "./FormInput";

type ExampleFormValues = {
  title: string;
};

function FormInputHarness({ setError = false }: { setError?: boolean }) {
  const form = useForm<ExampleFormValues>({
    defaultValues: {
      title: "Initial title"
    }
  });
  const title = useWatch({ control: form.control, name: "title" });

  useEffect(() => {
    if (setError) {
      form.setError("title", { message: "Title is required." });
    }
  }, [form, setError]);

  return (
    <ReactHookFormProvider {...form}>
      <FormInput<ExampleFormValues>
        description="Use a short title."
        label="Title"
        name="title"
        placeholder="Enter title"
      />
      <p aria-label="Current title">{title}</p>
    </ReactHookFormProvider>
  );
}

describe("FormInput", () => {
  it("connects a local input to react-hook-form state", () => {
    render(<FormInputHarness />);

    const input = screen.getByLabelText("Title");

    expect(input).toHaveValue("Initial title");

    fireEvent.change(input, { target: { value: "Updated title" } });

    expect(screen.getByLabelText("Current title")).toHaveTextContent(
      "Updated title"
    );
  });

  it("renders field errors from react-hook-form", async () => {
    render(<FormInputHarness setError />);

    const error = await screen.findByText("Title is required.");
    const input = screen.getByLabelText("Title");

    expect(error).toBeInTheDocument();
    expect(input).toHaveAccessibleDescription(
      "Use a short title. Title is required."
    );
    expect(input).toBeInvalid();
  });

  it("marks schema-required fields as required", () => {
    const schema = z.object({
      title: z.string().min(1, "Title is required."),
      subtitle: z.string().optional()
    });

    type SchemaFormValues = z.input<typeof schema>;

    render(
      <FormProvider
        defaultValues={{ title: "Initial title", subtitle: "" }}
        schema={schema}
      >
        <FormInput<SchemaFormValues> label="Title" name="title" />
        <FormInput<SchemaFormValues> label="Subtitle" name="subtitle" />
      </FormProvider>
    );

    expect(screen.getByLabelText("Title")).toBeRequired();
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.getByLabelText("Subtitle")).not.toBeRequired();
  });
});
