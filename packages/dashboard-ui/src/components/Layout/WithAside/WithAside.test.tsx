import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WithAside } from "./WithAside";

describe("WithAside", () => {
  it("renders a semantic aside before the main content and supports sticky aside layout", () => {
    const { container } = render(
      <WithAside aside={<p>Assessment rail</p>} stickyAside>
        <p>Timeline</p>
      </WithAside>
    );

    const aside = container.querySelector('[data-slot="with-aside-aside"]');
    const main = container.querySelector('[data-slot="with-aside-main"]');

    expect(screen.getByText("Assessment rail")).toBeInTheDocument();
    expect(screen.getByText("Timeline")).toBeInTheDocument();
    expect(aside?.tagName).toBe("ASIDE");
    expect(aside).toHaveClass("lg:sticky", "lg:top-6");
    expect(main).toHaveTextContent("Timeline");
  });
});
