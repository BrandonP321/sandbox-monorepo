import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Search } from "../../../icons";
import fieldStyles from "../FormField/FormField.module.scss";
import inputStyles from "./Input.module.scss";
import { Input } from "./Input";

describe("Input", () => {
  it("renders a generated label/input pair with description text", () => {
    const markup = renderToStaticMarkup(
      <Input
        defaultValue="OpenAI"
        description="Shown in portfolio project listings."
        label="Company name"
        placeholder="OpenAI"
      />
    );

    expect(markup).toContain(fieldStyles.root);
    expect(markup).toContain(fieldStyles.label);
    expect(markup).toContain(fieldStyles.description);
    expect(markup).toContain(inputStyles.input);
    expect(markup).toContain("Company name");
    expect(markup).toContain("Shown in portfolio project listings.");
    expect(markup).toContain('placeholder="OpenAI"');
    expect(markup).toContain('value="OpenAI"');

    const idMatch = markup.match(/id="([^"]+)"/);
    const htmlForMatch = markup.match(/for="([^"]+)"/);

    expect(idMatch?.[1]).toBeTruthy();
    expect(htmlForMatch?.[1]).toBe(idMatch?.[1]);
  });

  it("renders inline error state when requested", () => {
    const markup = renderToStaticMarkup(
      <Input error="Company name is required." label="Company name" />
    );

    expect(markup).toContain("Company name is required.");
    expect(markup).toContain('aria-invalid="true"');
  });

  it("respects the disabled prop on the native input", () => {
    const markup = renderToStaticMarkup(
      <Input defaultValue="OpenAI" disabled label="Company name" readOnly />
    );

    expect(markup).toContain("disabled");
    expect(markup).toContain('readOnly=""');
    expect(markup).toContain('value="OpenAI"');
  });

  it("renders a leading icon when requested", () => {
    const markup = renderToStaticMarkup(
      <Input defaultValue="OpenAI" iconLeft={Search} label="Company name" />
    );

    expect(markup).toContain(inputStyles.root);
    expect(markup).toContain(inputStyles.icon);
    expect(markup).toContain(inputStyles.inputWithIcon);
    expect(markup).toContain("<svg");
  });
});
