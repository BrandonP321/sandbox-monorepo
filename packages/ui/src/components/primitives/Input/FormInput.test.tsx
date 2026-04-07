import { renderToStaticMarkup } from "react-dom/server";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { Search } from "../../../icons";
import fieldStyles from "../FormField/FormField.module.scss";
import inputStyles from "./Input.module.scss";
import { FormInput } from "./FormInput";

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

describe("FormInput", () => {
  it("renders the RHF field value inside the shared input chrome", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ company: "OpenAI" }}>
        <FormInput
          description="Shown in portfolio project listings."
          label="Company name"
          name="company"
          placeholder="OpenAI"
        />
      </TestForm>
    );

    expect(markup).toContain(fieldStyles.root);
    expect(markup).toContain(fieldStyles.label);
    expect(markup).toContain(fieldStyles.description);
    expect(markup).toContain(inputStyles.input);
    expect(markup).toContain('value="OpenAI"');
  });

  it("coerces nullish RHF values to an empty string", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ company: undefined }}>
        <FormInput label="Company name" name="company" />
      </TestForm>
    );

    expect(markup).toContain('value=""');
  });

  it("passes disabled state through the RHF wrapper", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ company: "OpenAI" }}>
        <FormInput disabled label="Company name" name="company" readOnly />
      </TestForm>
    );

    expect(markup).toContain("disabled");
    expect(markup).toContain('readOnly=""');
  });

  it("renders a leading icon through the RHF wrapper", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ company: "OpenAI" }}>
        <FormInput iconLeft={Search} label="Company name" name="company" />
      </TestForm>
    );

    expect(markup).toContain(inputStyles.root);
    expect(markup).toContain(inputStyles.icon);
    expect(markup).toContain(inputStyles.inputWithIcon);
  });
});
