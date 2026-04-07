import { renderToStaticMarkup } from "react-dom/server";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import fieldStyles from "../FormField/FormField.module.scss";
import dropdownStyles from "./Dropdown.module.scss";
import { FormDropdown } from "./FormDropdown";

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

describe("FormDropdown", () => {
  it("renders a generated label/select pair with description text", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ country: "ca" }}>
        <FormDropdown
          description="Choose the market for this portfolio entry."
          label="Country"
          name="country"
          options={options}
          placeholder="Select a country"
        />
      </TestForm>
    );

    expect(markup).toContain(fieldStyles.root);
    expect(markup).toContain(fieldStyles.label);
    expect(markup).toContain(fieldStyles.description);
    expect(markup).toContain(dropdownStyles.dropdown);
  });

  it("renders an empty selection when the RHF field value is nullish", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ country: undefined }}>
        <FormDropdown
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

  it("respects the disabled prop on the RHF-backed select", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ country: "us" }}>
        <FormDropdown disabled label="Country" name="country" options={options} />
      </TestForm>
    );

    expect(markup).toContain("disabled");
    expect(markup).toContain('value="0" selected=""');
  });

  it("supports non-string option values through the RHF wrapper", () => {
    const markup = renderToStaticMarkup(
      <NumericTestForm defaultValues={{ priority: 2 }}>
        <FormDropdown<ExampleNumericFormValues, number>
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
