import { ArrowRight } from "./index";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

describe("@repo/ui/icons", () => {
  it("re-exports lucide glyphs for app consumption", () => {
    const markup = renderToStaticMarkup(<ArrowRight />);

    expect(markup).toContain("<svg");
  });
});
