import { forwardRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { FormProvider as SchemaFormProvider } from "../FormProvider/FormProvider";
import {
  FormTextareaControl,
  type FormTextareaControlProps,
  type FormTextareaControlRenderProps
} from "./FormTextareaControl";

type ExampleFormValues = {
  notes?: string | null;
};

type FakeTextareaViewProps = Omit<FormTextareaControlRenderProps, "ref">;

const FakeTextareaView = forwardRef<HTMLTextAreaElement, FakeTextareaViewProps>(
  function FakeTextareaView({ disabled, id, name, required, value }, ref) {
    return (
      <output
        data-disabled={String(Boolean(disabled))}
        data-has-ref={String(Boolean(ref))}
        data-id={id ?? ""}
        data-name={name ?? ""}
        data-required={String(Boolean(required))}
        data-value={String(value ?? "")}
      />
    );
  }
);

function TestForm({
  children,
  defaultValues
}: {
  children: React.ReactNode;
  defaultValues?: ExampleFormValues;
}) {
  const form = useForm<ExampleFormValues>({
    defaultValues
  });

  return <FormProvider {...form}>{children}</FormProvider>;
}

function TestField(
  props: Omit<FormTextareaControlProps<ExampleFormValues>, "children">
) {
  return (
    <FormTextareaControl<ExampleFormValues> {...props}>
      {({ ref, ...textareaProps }: FormTextareaControlRenderProps) => (
        <FakeTextareaView {...textareaProps} ref={ref} />
      )}
    </FormTextareaControl>
  );
}

describe("FormTextareaControl", () => {
  it("renders the RHF field value through the functional contract", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ notes: "Long note" }}>
        <TestField name="notes" />
      </TestForm>
    );

    expect(markup).toContain('data-name="notes"');
    expect(markup).toContain('data-value="Long note"');
  });

  it("coerces nullish RHF values to an empty string", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ notes: undefined }}>
        <TestField name="notes" />
      </TestForm>
    );

    expect(markup).toContain('data-value=""');
  });

  it("passes disabled state through the RHF wrapper", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ notes: "Long note" }}>
        <TestField disabled name="notes" />
      </TestForm>
    );

    expect(markup).toContain('data-disabled="true"');
  });

  it("passes schema-required state through the RHF wrapper", () => {
    const schema = z.object({
      notes: z.string().min(1),
      optionalNotes: z.string().optional()
    });

    type SchemaFormValues = z.input<typeof schema>;

    const markup = renderToStaticMarkup(
      <SchemaFormProvider
        defaultValues={{ notes: "Long note", optionalNotes: "" }}
        schema={schema}
      >
        <FormTextareaControl<SchemaFormValues> name="notes">
          {({ ref, ...textareaProps }: FormTextareaControlRenderProps) => (
            <FakeTextareaView {...textareaProps} ref={ref} />
          )}
        </FormTextareaControl>
        <FormTextareaControl<SchemaFormValues> name="optionalNotes">
          {({ ref, ...textareaProps }: FormTextareaControlRenderProps) => (
            <FakeTextareaView {...textareaProps} ref={ref} />
          )}
        </FormTextareaControl>
      </SchemaFormProvider>
    );

    expect(markup).toContain('data-name="notes"');
    expect(markup).toContain('data-required="true"');
    expect(markup).toContain('data-name="optionalNotes"');
    expect(markup).toContain('data-required="false"');
  });
});
