import { ChevronRight, Plus } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("renders a semantic button with stable defaults", () => {
    const markup = renderToStaticMarkup(<Button disabled>Save</Button>);

    expect(markup).toContain('type="button"');
    expect(markup).toContain("_secondary_");
    expect(markup).toContain("_md_");
    expect(markup).toContain("Save");
    expect(markup).toContain("disabled");
  });

  it("supports the minimal shared variant surface", () => {
    const markup = renderToStaticMarkup(
      <Button fullWidth size="sm" type="submit" variant="secondary">
        Continue
      </Button>
    );

    expect(markup).toContain('type="submit"');
    expect(markup).toContain("_secondary_");
    expect(markup).toContain("_sm_");
    expect(markup).toContain("_fullWidth_");
    expect(markup).toContain("Continue");
  });

  it("renders leading and trailing icon slots around the label", () => {
    const markup = renderToStaticMarkup(
      <Button iconLeft={Plus} iconRight={ChevronRight}>
        Add item
      </Button>
    );

    expect(markup).toContain("_icon_");
    expect(markup).toContain("_label_");
    expect(markup).toContain("Add item");
    expect(markup.indexOf("Add item")).toBeGreaterThan(markup.indexOf("<svg"));
    expect(markup.lastIndexOf("<svg")).toBeGreaterThan(markup.indexOf("Add item"));
  });
});
