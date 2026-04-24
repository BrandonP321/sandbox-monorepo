import { renderToStaticMarkup } from "react-dom/server";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { useFormField } from "./useFormField";

type ExampleFormValues = {
  company?: string | null;
};

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

function FieldReader({ disabled = false }: { disabled?: boolean }) {
  const { isDisabled, name, value } = useFormField<ExampleFormValues, string>(
    "company",
    disabled
  );

  return (
    <output
      data-disabled={String(isDisabled)}
      data-name={name}
      data-value={String(value ?? "")}
    />
  );
}

describe("useFormField", () => {
  it("returns the current RHF field name and value", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ company: "OpenAI" }}>
        <FieldReader />
      </TestForm>
    );

    expect(markup).toContain('data-disabled="false"');
    expect(markup).toContain('data-name="company"');
    expect(markup).toContain('data-value="OpenAI"');
  });

  it("marks the field as disabled when the wrapper requests it", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ company: "OpenAI" }}>
        <FieldReader disabled />
      </TestForm>
    );

    expect(markup).toContain('data-disabled="true"');
  });
});
