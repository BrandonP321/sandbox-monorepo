import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContentHeader } from "./ContentHeader";

describe("ContentHeader", () => {
  it("renders a heading and description", () => {
    render(
      <ContentHeader
        description="Selected work in analytics products and policy tooling."
        title="Portfolio"
      />
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Portfolio" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Selected work in analytics products and policy tooling."
      )
    ).toBeInTheDocument();
  });

  it("uses the requested semantic heading level", () => {
    render(<ContentHeader headingLevel={3} title="Section" />);

    expect(
      screen.getByRole("heading", { level: 3, name: "Section" })
    ).toBeInTheDocument();
  });

  it("supports a caller-provided class name", () => {
    const { container } = render(
      <ContentHeader
        className="portfolio-page-heading"
        headingLevel={2}
        title="Writing"
      />
    );

    expect(container.firstElementChild).toHaveClass("portfolio-page-heading");
  });
});
