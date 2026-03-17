import { renderToStaticMarkup } from "react-dom/server";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { CheckboxGroup } from "./CheckboxGroup";

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

const options = [
  { label: "Founders", value: "founders" },
  { label: "Operators", value: "operators" },
  { label: "Researchers", value: "researchers" }
] as const;

const regionOptions = [
  {
    label: "North America",
    value: {
      code: "na",
      label: "North America"
    }
  },
  {
    label: "Europe",
    value: {
      code: "eu",
      label: "Europe"
    }
  }
] as const;

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

describe("CheckboxGroup", () => {
  it("renders a grouped checkbox field with legend and description text", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ audience: ["founders", "researchers"] }}>
        <CheckboxGroup
          description="Select every audience segment this report applies to."
          label="Audience"
          name="audience"
          options={options}
        />
      </TestForm>
    );

    expect(markup).toContain("<fieldset");
    expect(markup).toContain('class="ui-form-field"');
    expect(markup).toContain('class="ui-form-field-label"');
    expect(markup).toContain('class="ui-checkbox-group"');
    expect(markup).toContain('class="ui-checkbox-control"');
    expect(markup).toContain('class="ui-checkbox-input"');
    expect(markup).toContain('class="ui-checkbox-label"');
    expect(markup).toContain("Audience");
    expect(markup).toContain(
      "Select every audience segment this report applies to."
    );
    expect(markup).toContain("Founders");
    expect(markup).toContain("Operators");
    expect(markup).toContain("Researchers");
    expect(markup.match(/checked=""/g)?.length).toBe(2);
  });

  it("renders an unchecked group when the field value is nullish", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ audience: undefined }}>
        <CheckboxGroup label="Audience" name="audience" options={options} />
      </TestForm>
    );

    expect(markup).not.toContain('checked=""');
  });

  it("respects the disabled prop on each native checkbox", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ audience: ["operators"] }}>
        <CheckboxGroup
          disabled
          label="Audience"
          name="audience"
          options={options}
        />
      </TestForm>
    );

    expect(markup.match(/disabled=""/g)?.length).toBe(options.length);
    expect(markup).toContain('checked=""');
  });

  it("supports non-string option values through a generic array value type", () => {
    const markup = renderToStaticMarkup(
      <ObjectValueTestForm
        defaultValues={{ regions: [regionOptions[1].value] }}
      >
        <CheckboxGroup<ExampleObjectFormValues, RegionValue>
          label="Regions"
          name="regions"
          options={regionOptions}
        />
      </ObjectValueTestForm>
    );

    expect(markup).toContain("Regions");
    expect(markup).toContain("North America");
    expect(markup).toContain("Europe");
    expect(markup.match(/checked=""/g)?.length).toBe(1);
  });
});
