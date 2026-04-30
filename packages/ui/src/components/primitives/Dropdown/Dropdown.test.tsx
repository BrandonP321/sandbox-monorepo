import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import fieldStyles from "../FormField/FormField.module.scss";
import dropdownStyles from "./Dropdown.module.scss";
import { Dropdown } from "./Dropdown";

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

describe("Dropdown", () => {
  it("renders a generated label/select pair with description text", () => {
    const markup = renderToStaticMarkup(
      <Dropdown
        defaultValue="ca"
        description="Choose the market for this portfolio entry."
        label="Country"
        options={options}
        placeholder="Select a country"
      />
    );

    expect(markup).toContain(fieldStyles.root);
    expect(markup).toContain(fieldStyles.label);
    expect(markup).toContain(fieldStyles.description);
    expect(markup).toContain(dropdownStyles.dropdown);
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
      <Dropdown
        label="Country"
        options={options}
        placeholder="Select a country"
      />
    );

    expect(markup).toContain('value=""');
    expect(markup).toContain("Select a country");
  });

  it("respects the disabled prop on the native select", () => {
    const markup = renderToStaticMarkup(
      <Dropdown defaultValue="us" disabled label="Country" options={options} />
    );

    expect(markup).toContain("disabled");
    expect(markup).toContain('value="0" selected=""');
  });

  it("supports non-string option values through a generic value type", () => {
    const markup = renderToStaticMarkup(
      <Dropdown<number>
        defaultValue={2}
        label="Priority"
        options={numericOptions}
        placeholder="Select a priority"
      />
    );

    expect(markup).toContain("Priority");
    expect(markup).toContain("Medium");
    expect(markup).toContain('value="1"');
  });
});
