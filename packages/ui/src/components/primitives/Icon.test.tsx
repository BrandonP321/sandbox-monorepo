import { Check } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Icon } from "./Icon";

describe("Icon", () => {
  it("renders a lucide icon with token-backed default sizing hooks", () => {
    const markup = renderToStaticMarkup(<Icon icon={Check} />);

    expect(markup).toContain("<svg");
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain("_root_");
    expect(markup).toContain("_md_");
  });

  it("supports alternate icon sizes", () => {
    const markup = renderToStaticMarkup(<Icon icon={Check} size="lg" />);

    expect(markup).toContain("_lg_");
  });
});
