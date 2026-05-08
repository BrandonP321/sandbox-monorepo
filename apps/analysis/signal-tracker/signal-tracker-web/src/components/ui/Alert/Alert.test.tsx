import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Alert } from "./Alert";

const rawStatusPaletteClassPattern = /(sky|emerald|amber)-/;

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

  it.each([
    {
      alertClasses: ["border-danger/40", "bg-danger/5", "text-foreground"],
      iconClass: "text-danger",
      variant: "danger"
    },
    {
      alertClasses: ["border-info/30", "bg-info/5", "text-foreground"],
      iconClass: "text-info-foreground",
      variant: "info"
    },
    {
      alertClasses: ["border-success/30", "bg-success/5", "text-foreground"],
      iconClass: "text-success-foreground",
      variant: "success"
    },
    {
      alertClasses: ["border-warning/30", "bg-warning/5", "text-foreground"],
      iconClass: "text-warning-foreground",
      variant: "warning"
    }
  ] as const)(
    "uses semantic status token classes for the $variant variant",
    ({ alertClasses, iconClass, variant }) => {
      render(
        <Alert title={`${variant} alert`} variant={variant}>
          Alert body
        </Alert>
      );

      const alert = screen.getByRole("alert");
      const icon = alert.querySelector("[data-slot='alert-icon']");

      expect(alert).toHaveClass(...alertClasses);
      expect(alert.className).not.toMatch(rawStatusPaletteClassPattern);
      expect(icon).toHaveClass(iconClass);
      expect(icon?.getAttribute("class") ?? "").not.toMatch(
        rawStatusPaletteClassPattern
      );
    }
  );
});
