import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContentFrame, DecorativeLayer, FormSection } from "./Layout";

describe("layout primitives", () => {
  it("exposes the selected content-width convention", () => {
    render(<ContentFrame data-testid="frame" width="hero" />);

    expect(screen.getByTestId("frame")).toHaveAttribute("data-width", "hero");
  });

  it("keeps form surfaces semantic", () => {
    render(<FormSection aria-label="Contact details" />);

    expect(
      screen.getByRole("region", { name: "Contact details" })
    ).toBeInTheDocument();
  });

  it("always hides decorative content from assistive technology", () => {
    render(
      <DecorativeLayer data-testid="decorations">
        <span>Decorative flourish</span>
      </DecorativeLayer>
    );

    expect(screen.getByTestId("decorations")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });
});
