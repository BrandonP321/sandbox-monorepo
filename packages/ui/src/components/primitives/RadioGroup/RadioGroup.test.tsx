import { renderToStaticMarkup } from "react-dom/server";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import fieldStyles from "../FormField/FormField.module.scss";
import radioStyles from "./RadioGroup.module.scss";
import { RadioGroup } from "./RadioGroup";

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

describe("RadioGroup", () => {
  it("renders a grouped radio field with legend and description text", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ audience: "researchers" }}>
        <RadioGroup
          description="Choose the primary audience for this report."
          label="Audience"
          name="audience"
          options={options}
        />
      </TestForm>
    );

    expect(markup).toContain("<fieldset");
    expect(markup).toContain(fieldStyles.root);
    expect(markup).toContain(fieldStyles.label);
    expect(markup).toContain(radioStyles.group);
    expect(markup).toContain(radioStyles.control);
    expect(markup).toContain(radioStyles.input);
    expect(markup).toContain(radioStyles.label);
    expect(markup).toContain("Audience");
    expect(markup).toContain("Choose the primary audience for this report.");
    expect(markup).toContain("Founders");
    expect(markup).toContain("Operators");
    expect(markup).toContain("Researchers");
    expect(markup.match(/checked=""/g)?.length).toBe(1);
  });

  it("renders an unselected group when the field value is nullish", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ audience: undefined }}>
        <RadioGroup label="Audience" name="audience" options={options} />
      </TestForm>
    );

    expect(markup).not.toContain('checked=""');
  });

  it("respects the disabled prop on each native radio input", () => {
    const markup = renderToStaticMarkup(
      <TestForm defaultValues={{ audience: "operators" }}>
        <RadioGroup disabled label="Audience" name="audience" options={options} />
      </TestForm>
    );

    expect(markup.match(/disabled=""/g)?.length).toBe(options.length);
    expect(markup).toContain('checked=""');
  });

  it("supports non-string option values through a generic value type", () => {
    const markup = renderToStaticMarkup(
      <ObjectValueTestForm defaultValues={{ region: regionOptions[1].value }}>
        <RadioGroup<ExampleObjectFormValues, RegionValue>
          label="Region"
          name="region"
          options={regionOptions}
        />
      </ObjectValueTestForm>
    );

    expect(markup).toContain("Region");
    expect(markup).toContain("North America");
    expect(markup).toContain("Europe");
    expect(markup.match(/checked=""/g)?.length).toBe(1);
  });
});
