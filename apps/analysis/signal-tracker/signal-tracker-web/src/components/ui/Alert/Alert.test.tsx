import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Alert } from "./Alert";

describe("Alert", () => {
  it("renders alert title, content, and actions", () => {
    const { container } = render(
      <Alert
        actions={<button type="button">Retry</button>}
        title="Topics could not be loaded."
      >
        Retry the request.
      </Alert>
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Topics could not be loaded.")).toBeInTheDocument();
    expect(screen.getByText("Retry the request.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(container.querySelector("[data-slot='alert-icon']")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });

  it.each(["danger", "info", "success", "warning"] as const)(
    "renders the %s variant",
    (variant) => {
      render(
        <Alert title={`${variant} alert`} variant={variant}>
          Alert body
        </Alert>
      );

      expect(screen.getByRole("alert")).toHaveTextContent(`${variant} alert`);
      expect(screen.getByText("Alert body")).toBeInTheDocument();
    }
  );
});
