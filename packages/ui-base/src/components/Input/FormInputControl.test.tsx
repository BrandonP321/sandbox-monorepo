import { forwardRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import {
  FormInputControl,
  type FormInputControlProps,
  type FormInputControlRenderProps
} from "./FormInputControl";

type ExampleFormValues = {
  company?: string | null;
};

type FakeInputViewProps = Omit<FormInputControlRenderProps, "ref">;

const FakeInputView = forwardRef<HTMLInputElement, FakeInputViewProps>(
  function FakeInputView({ disabled, id, name, value }, ref) {
    return (
      <output
        data-disabled={String(Boolean(disabled))}
        data-has-ref={String(Boolean(ref))}
        data-id={id ?? ""}
        data-name={name ?? ""}
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

function TestField(props: Omit<FormInputControlProps<ExampleFormValues>, "children">) {
  return (
    <FormInputControl<ExampleFormValues> {...props}>
      {({ ref, ...inputProps }: FormInputControlRenderProps) => (
        <FakeInputView {...inputProps} ref={ref} />
      )}
    </FormInputControl>
  );
}

describe("FormInputControl", () => {
  it("renders the RHF field value through the functional contract", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ company: "OpenAI" }}>
        <TestField name="company" />
      </TestForm>
    );

    expect(markup).toContain('data-name="company"');
    expect(markup).toContain('data-value="OpenAI"');
  });

  it("coerces nullish RHF values to an empty string", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ company: undefined }}>
        <TestField name="company" />
      </TestForm>
    );

    expect(markup).toContain('data-value=""');
  });

  it("passes disabled state through the RHF wrapper", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ company: "OpenAI" }}>
        <TestField disabled name="company" />
      </TestForm>
    );

    expect(markup).toContain('data-disabled="true"');
  });
});
