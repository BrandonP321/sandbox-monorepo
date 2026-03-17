import { renderToStaticMarkup } from "react-dom/server";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { Input } from "./Input";

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

describe("Input", () => {
  it("renders a generated label/input pair with description text", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ company: "OpenAI" }}>
        <Input
          description="Shown in portfolio project listings."
          label="Company name"
          name="company"
          placeholder="OpenAI"
        />
      </TestForm>
    );

    expect(markup).toContain('class="ui-form-field"');
    expect(markup).toContain('class="ui-form-field-label"');
    expect(markup).toContain('class="ui-form-field-description"');
    expect(markup).toContain('class="ui-input"');
    expect(markup).toContain("Company name");
    expect(markup).toContain("Shown in portfolio project listings.");
    expect(markup).toContain('placeholder="OpenAI"');
    expect(markup).toContain('value="OpenAI"');

    const idMatch = markup.match(/id="([^"]+)"/);
    const htmlForMatch = markup.match(/for="([^"]+)"/);

    expect(idMatch?.[1]).toBeTruthy();
    expect(htmlForMatch?.[1]).toBe(idMatch?.[1]);
  });

  it("renders an empty string when the field value is nullish", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ company: undefined }}>
        <Input label="Company name" name="company" />
      </TestForm>
    );

    expect(markup).toContain('value=""');
  });

  it("respects the disabled prop on the native input", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ company: "OpenAI" }}>
        <Input disabled label="Company name" name="company" readOnly />
      </TestForm>
    );

    expect(markup).toContain("disabled");
    expect(markup).toContain('readOnly=""');
    expect(markup).toContain('value="OpenAI"');
  });
});
