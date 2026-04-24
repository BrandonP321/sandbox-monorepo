import { forwardRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import {
  FormRadioGroupControl,
  type FormRadioGroupControlProps,
  type FormRadioGroupControlRenderProps
} from "./FormRadioGroupControl";

type ExampleFormValues = {
  audience?: string | null;
};

type RegionValue = {
  code: string;
  label: string;
};

type ExampleObjectFormValues = {
  region?: RegionValue | null;
};

type FakeRadioGroupViewProps<TValue> = Omit<
  FormRadioGroupControlRenderProps<TValue>,
  "ref"
>;

const FakeRadioGroupView = forwardRef<
  HTMLInputElement,
  FakeRadioGroupViewProps<string>
>(function FakeRadioGroupView({ disabled, id, name, value }, ref) {
  return (
    <output
      data-disabled={String(Boolean(disabled))}
      data-has-ref={String(Boolean(ref))}
      data-id={id ?? ""}
      data-name={name ?? ""}
      data-value={String(value ?? "")}
    />
  );
});

const FakeObjectRadioGroupView = forwardRef<
  HTMLInputElement,
  FakeRadioGroupViewProps<RegionValue>
>(function FakeObjectRadioGroupView({ value }, ref) {
  return (
    <output
      data-has-ref={String(Boolean(ref))}
      data-value={JSON.stringify(value ?? null)}
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
  props: Omit<FormRadioGroupControlProps<ExampleFormValues>, "children">
) {
  return (
    <FormRadioGroupControl<ExampleFormValues> {...props}>
      {({ ref, ...radioGroupProps }: FormRadioGroupControlRenderProps) => (
        <FakeRadioGroupView {...radioGroupProps} ref={ref} />
      )}
    </FormRadioGroupControl>
  );
}

function ObjectValueTestField(
  props: Omit<
    FormRadioGroupControlProps<ExampleObjectFormValues, RegionValue>,
    "children"
  >
) {
  return (
    <FormRadioGroupControl<ExampleObjectFormValues, RegionValue> {...props}>
      {({
        ref,
        ...radioGroupProps
      }: FormRadioGroupControlRenderProps<RegionValue>) => (
        <FakeObjectRadioGroupView {...radioGroupProps} ref={ref} />
      )}
    </FormRadioGroupControl>
  );
}

describe("FormRadioGroupControl", () => {
  it("renders the RHF field value through the functional contract", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ audience: "researchers" }}>
        <TestField name="audience" />
      </TestForm>
    );

    expect(markup).toContain('data-name="audience"');
    expect(markup).toContain('data-value="researchers"');
  });

  it("keeps a nullish RHF value undefined for the functional contract", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ audience: undefined }}>
        <TestField name="audience" />
      </TestForm>
    );

    expect(markup).toContain('data-value=""');
  });

  it("passes disabled state through the RHF wrapper", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ audience: "operators" }}>
        <TestField disabled name="audience" />
      </TestForm>
    );

    expect(markup).toContain('data-disabled="true"');
  });

  it("supports non-string RHF values", () => {
    const markup = renderToStaticMarkup(
      <ObjectValueTestForm defaultValues={{ region: { code: "eu", label: "Europe" } }}>
        <ObjectValueTestField name="region" />
      </ObjectValueTestForm>
    );

    expect(markup).toContain('&quot;code&quot;:&quot;eu&quot;');
  });
});
