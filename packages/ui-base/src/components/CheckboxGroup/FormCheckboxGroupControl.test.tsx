import { forwardRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import {
  FormCheckboxGroupControl,
  type FormCheckboxGroupControlProps,
  type FormCheckboxGroupControlRenderProps
} from "./FormCheckboxGroupControl";

type ExampleFormValues = {
  audience?: string[] | null;
};

type RegionValue = {
  code: string;
  label: string;
};

type ExampleObjectFormValues = {
  regions?: RegionValue[] | null;
};

type FakeCheckboxGroupViewProps<TValue> = Omit<
  FormCheckboxGroupControlRenderProps<TValue>,
  "ref"
>;

const FakeCheckboxGroupView = forwardRef<
  HTMLInputElement,
  FakeCheckboxGroupViewProps<string>
>(function FakeCheckboxGroupView({ disabled, id, name, value }, ref) {
  return (
    <output
      data-disabled={String(Boolean(disabled))}
      data-has-ref={String(Boolean(ref))}
      data-id={id ?? ""}
      data-name={name ?? ""}
      data-value={JSON.stringify(value)}
    />
  );
});

const FakeObjectCheckboxGroupView = forwardRef<
  HTMLInputElement,
  FakeCheckboxGroupViewProps<RegionValue>
>(function FakeObjectCheckboxGroupView({ value }, ref) {
  return (
    <output
      data-has-ref={String(Boolean(ref))}
      data-value={JSON.stringify(value)}
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

function ObjectValueTestForm({
  children,
  defaultValues
}: {
  children: React.ReactNode;
  defaultValues?: ExampleObjectFormValues;
}) {
  const form = useForm<ExampleObjectFormValues>({
    defaultValues
  });

  return <FormProvider {...form}>{children}</FormProvider>;
}

function TestField(
  props: Omit<FormCheckboxGroupControlProps<ExampleFormValues>, "children">
) {
  return (
    <FormCheckboxGroupControl<ExampleFormValues> {...props}>
      {({
        ref,
        ...checkboxGroupProps
      }: FormCheckboxGroupControlRenderProps) => (
        <FakeCheckboxGroupView {...checkboxGroupProps} ref={ref} />
      )}
    </FormCheckboxGroupControl>
  );
}

function ObjectValueTestField(
  props: Omit<
    FormCheckboxGroupControlProps<ExampleObjectFormValues, RegionValue>,
    "children"
  >
) {
  return (
    <FormCheckboxGroupControl<ExampleObjectFormValues, RegionValue> {...props}>
      {({
        ref,
        ...checkboxGroupProps
      }: FormCheckboxGroupControlRenderProps<RegionValue>) => (
        <FakeObjectCheckboxGroupView {...checkboxGroupProps} ref={ref} />
      )}
    </FormCheckboxGroupControl>
  );
}

describe("FormCheckboxGroupControl", () => {
  it("renders the RHF field value through the functional contract", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ audience: ["founders", "researchers"] }}>
        <TestField name="audience" />
      </TestForm>
    );

    expect(markup).toContain('data-name="audience"');
    expect(markup).toContain('data-value="[&quot;founders&quot;,&quot;researchers&quot;]"');
  });

  it("normalizes nullish RHF values to an empty array", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ audience: undefined }}>
        <TestField name="audience" />
      </TestForm>
    );

    expect(markup).toContain('data-value="[]"');
  });

  it("passes disabled state through the RHF wrapper", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ audience: ["operators"] }}>
        <TestField disabled name="audience" />
      </TestForm>
    );

    expect(markup).toContain('data-disabled="true"');
  });

  it("supports non-string RHF values", () => {
    const markup = renderToStaticMarkup(
      <ObjectValueTestForm defaultValues={{ regions: [{ code: "eu", label: "Europe" }] }}>
        <ObjectValueTestField name="regions" />
      </ObjectValueTestForm>
    );

    expect(markup).toContain('&quot;code&quot;:&quot;eu&quot;');
  });
});
