import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import fieldStyles from "../FormField/FormField.module.scss";
import checkboxStyles from "./CheckboxGroup.module.scss";
import { CheckboxGroup } from "./CheckboxGroup";

type RegionValue = {
  code: string;
  label: string;
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

describe("CheckboxGroup", () => {
  it("renders a grouped checkbox field with legend and description text", () => {
    const markup = renderToStaticMarkup(
      <CheckboxGroup
        defaultValue={["founders", "researchers"]}
        description="Select every audience segment this report applies to."
        label="Audience"
        options={options}
      />
    );

    expect(markup).toContain("<fieldset");
    expect(markup).toContain(fieldStyles.root);
    expect(markup).toContain(fieldStyles.label);
    expect(markup).toContain(checkboxStyles.group);
    expect(markup).toContain(checkboxStyles.control);
    expect(markup).toContain(checkboxStyles.input);
    expect(markup).toContain(checkboxStyles.label);
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
      <CheckboxGroup label="Audience" options={options} />
    );

    expect(markup).not.toContain('checked=""');
  });

  it("respects the disabled prop on each native checkbox", () => {
    const markup = renderToStaticMarkup(
      <CheckboxGroup
        defaultValue={["operators"]}
        disabled
        label="Audience"
        options={options}
      />
    );

    expect(markup.match(/disabled=""/g)?.length).toBe(options.length);
    expect(markup).toContain('checked=""');
  });

  it("supports non-string option values through a generic array value type", () => {
    const markup = renderToStaticMarkup(
      <CheckboxGroup<RegionValue>
        defaultValue={[regionOptions[1].value]}
        label="Regions"
        options={regionOptions}
      />
    );

    expect(markup).toContain("Regions");
    expect(markup).toContain("North America");
    expect(markup).toContain("Europe");
    expect(markup.match(/checked=""/g)?.length).toBe(1);
  });
});
