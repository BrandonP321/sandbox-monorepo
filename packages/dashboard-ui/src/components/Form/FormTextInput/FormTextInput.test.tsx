import { fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import {
  FormProvider as ReactHookFormProvider,
  useForm,
  useWatch
} from "react-hook-form";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { FormProvider } from "../FormProvider";
import { FormTextInput } from "./FormTextInput";

type ExampleFormValues = {
  title: string;
};

function FormTextInputHarness({ setError = false }: { setError?: boolean }) {
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
      <FormTextInput<ExampleFormValues>
        description="Use a short title."
        label="Title"
        name="title"
        placeholder="Enter title"
      />
      <p aria-label="Current title">{title}</p>
    </ReactHookFormProvider>
  );
}

describe("FormTextInput", () => {
  it("connects a local text input to react-hook-form state", () => {
    render(<FormTextInputHarness />);

    const input = screen.getByLabelText("Title");

    expect(input).toHaveValue("Initial title");

    fireEvent.change(input, { target: { value: "Updated title" } });

    expect(screen.getByLabelText("Current title")).toHaveTextContent(
      "Updated title"
    );
  });

  it("renders field errors from react-hook-form", async () => {
    render(<FormTextInputHarness setError />);

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
        <FormTextInput<SchemaFormValues> label="Title" name="title" />
        <FormTextInput<SchemaFormValues> label="Subtitle" name="subtitle" />
      </FormProvider>
    );

    expect(screen.getByLabelText("Title")).toBeRequired();
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.getByLabelText("Subtitle")).not.toBeRequired();
  });

  it("keeps field names scoped to string form values", () => {
    type StrictFormValues = {
      probabilityPct?: number;
      title: string;
    };
    type FormTextInputName = Parameters<
      typeof FormTextInput<StrictFormValues>
    >[0]["name"];

    const validName = "title" satisfies FormTextInputName;
    // @ts-expect-error FormTextInput only accepts string-backed field names.
    const invalidName = "probabilityPct" satisfies FormTextInputName;

    expect(validName).toBe("title");
    expect(invalidName).toBe("probabilityPct");
  });
});
