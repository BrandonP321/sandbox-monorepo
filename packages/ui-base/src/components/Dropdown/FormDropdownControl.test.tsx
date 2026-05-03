import { forwardRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { FormProvider as SchemaFormProvider } from "../FormProvider/FormProvider";

import {
  FormDropdownControl,
  type FormDropdownControlProps,
  type FormDropdownControlRenderProps
} from "./FormDropdownControl";

type ExampleFormValues = {
  country?: string | null;
};

type ExampleNumericFormValues = {
  priority?: number | null;
};

type FakeDropdownViewProps<TValue> = Omit<
  FormDropdownControlRenderProps<TValue>,
  "ref"
>;

const FakeDropdownView = forwardRef<
  HTMLSelectElement,
  FakeDropdownViewProps<string>
>(function FakeDropdownView({ disabled, id, name, required, value }, ref) {
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
});

const FakeNumericDropdownView = forwardRef<
  HTMLSelectElement,
  FakeDropdownViewProps<number>
>(function FakeNumericDropdownView({ value }, ref) {
  return (
    <output
      data-has-ref={String(Boolean(ref))}
      data-value={String(value ?? "")}
    />
  );
});

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

function NumericTestForm({
  children,
  defaultValues
}: {
  children: React.ReactNode;
  defaultValues?: ExampleNumericFormValues;
}) {
  const form = useForm<ExampleNumericFormValues>({
    defaultValues
  });

  return <FormProvider {...form}>{children}</FormProvider>;
}

function TestField(
  props: Omit<FormDropdownControlProps<ExampleFormValues>, "children">
) {
  return (
    <FormDropdownControl<ExampleFormValues> {...props}>
      {({ ref, ...dropdownProps }: FormDropdownControlRenderProps) => (
        <FakeDropdownView {...dropdownProps} ref={ref} />
      )}
    </FormDropdownControl>
  );
}

function NumericTestField(
  props: Omit<
    FormDropdownControlProps<ExampleNumericFormValues, number>,
    "children"
  >
) {
  return (
    <FormDropdownControl<ExampleNumericFormValues, number> {...props}>
      {({ ref, ...dropdownProps }: FormDropdownControlRenderProps<number>) => (
        <FakeNumericDropdownView {...dropdownProps} ref={ref} />
      )}
    </FormDropdownControl>
  );
}

describe("FormDropdownControl", () => {
  it("renders the RHF field value through the functional contract", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ country: "ca" }}>
        <TestField name="country" />
      </TestForm>
    );

    expect(markup).toContain('data-name="country"');
    expect(markup).toContain('data-value="ca"');
  });

  it("passes disabled state through the RHF wrapper", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ country: "us" }}>
        <TestField disabled name="country" />
      </TestForm>
    );

    expect(markup).toContain('data-disabled="true"');
  });

  it("supports non-string RHF values", () => {
    const markup = renderToStaticMarkup(
      <NumericTestForm defaultValues={{ priority: 2 }}>
        <NumericTestField name="priority" />
      </NumericTestForm>
    );

    expect(markup).toContain('data-value="2"');
  });

  it("passes schema-required state through the RHF wrapper", () => {
    const schema = z.object({
      country: z.string().min(1),
      optionalCountry: z.string().optional()
    });

    type SchemaFormValues = z.input<typeof schema>;

    const markup = renderToStaticMarkup(
      <SchemaFormProvider
        defaultValues={{ country: "ca", optionalCountry: "" }}
        schema={schema}
      >
        <FormDropdownControl<SchemaFormValues> name="country">
          {({ ref, ...dropdownProps }: FormDropdownControlRenderProps) => (
            <FakeDropdownView {...dropdownProps} ref={ref} />
          )}
        </FormDropdownControl>
        <FormDropdownControl<SchemaFormValues> name="optionalCountry">
          {({ ref, ...dropdownProps }: FormDropdownControlRenderProps) => (
            <FakeDropdownView {...dropdownProps} ref={ref} />
          )}
        </FormDropdownControl>
      </SchemaFormProvider>
    );

    expect(markup).toContain('data-name="country"');
    expect(markup).toContain('data-required="true"');
    expect(markup).toContain('data-name="optionalCountry"');
    expect(markup).toContain('data-required="false"');
  });
});
