import { renderToStaticMarkup } from "react-dom/server";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { Dropdown } from "./Dropdown";

type ExampleFormValues = {
  country?: string | null;
};

type ExampleNumericFormValues = {
  priority?: number | null;
};

const options = [
  { label: "United States", value: "us" },
  { label: "Canada", value: "ca" },
  { label: "United Kingdom", value: "uk" }
];

const numericOptions = [
  { label: "Low", value: 1 },
  { label: "Medium", value: 2 },
  { label: "High", value: 3 }
];

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

describe("Dropdown", () => {
  it("renders a generated label/select pair with description text", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ country: "ca" }}>
        <Dropdown
          description="Choose the market for this portfolio entry."
          label="Country"
          name="country"
          options={options}
          placeholder="Select a country"
        />
      </TestForm>
    );

    expect(markup).toContain('class="ui-form-field"');
    expect(markup).toContain('class="ui-form-field-label"');
    expect(markup).toContain('class="ui-form-field-description"');
    expect(markup).toContain('class="ui-dropdown"');
    expect(markup).toContain("Country");
    expect(markup).toContain("Choose the market for this portfolio entry.");
    expect(markup).toContain("United States");
    expect(markup).toContain("Canada");
    expect(markup).toContain("United Kingdom");

    const idMatch = markup.match(/id="([^"]+)"/);
    const htmlForMatch = markup.match(/for="([^"]+)"/);

    expect(idMatch?.[1]).toBeTruthy();
    expect(htmlForMatch?.[1]).toBe(idMatch?.[1]);
  });

  it("renders an empty selection when the field value is nullish", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ country: undefined }}>
        <Dropdown
          label="Country"
          name="country"
          options={options}
          placeholder="Select a country"
        />
      </TestForm>
    );

    expect(markup).toContain('value=""');
    expect(markup).toContain("Select a country");
  });

  it("respects the disabled prop on the native select", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ country: "us" }}>
        <Dropdown disabled label="Country" name="country" options={options} />
      </TestForm>
    );

    expect(markup).toContain("disabled");
    expect(markup).toContain('value="0" selected=""');
  });

  it("supports non-string option values through a generic value type", () => {
    const markup = renderToStaticMarkup(
      <NumericTestForm defaultValues={{ priority: 2 }}>
        <Dropdown<ExampleNumericFormValues, number>
          label="Priority"
          name="priority"
          options={numericOptions}
          placeholder="Select a priority"
        />
      </NumericTestForm>
    );

    expect(markup).toContain("Priority");
    expect(markup).toContain("Medium");
    expect(markup).toContain('value="1"');
  });
});
