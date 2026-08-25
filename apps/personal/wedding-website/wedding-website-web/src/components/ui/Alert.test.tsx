import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Alert } from "./Alert";

describe("Alert", () => {
  it("announces a full title and message while keeping its icon decorative", () => {
    const { container } = render(
      <Alert title="Contact details required">
        Enter at least an email address or phone number.
      </Alert>
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Contact details required");
    expect(alert).toHaveTextContent(
      "Enter at least an email address or phone number."
    );
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });
});
