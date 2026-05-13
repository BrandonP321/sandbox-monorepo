import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@repo/dashboard-ui";
import { Flashbar, type FlashbarType } from "./Flashbar";

const rawStatusPaletteClassPattern = /(sky|emerald|amber)-/;

const statusTokenClassPattern = /(bg|border)-(danger|info|success|warning)\//;

const variantNotifications = [
  {
    notificationClasses: ["bg-danger", "text-danger-foreground"],
    header: "Sync failed.",
    type: "error"
  },
  {
    notificationClasses: ["bg-info", "text-white"],
    header: "Sync started.",
    type: "info"
  },
  {
    notificationClasses: ["bg-success", "text-white"],
    header: "Sync complete.",
    type: "success"
  },
  {
    notificationClasses: ["bg-warning", "text-foreground"],
    header: "Sync delayed.",
    type: "warning"
  }
] satisfies Array<{
  notificationClasses: string[];
  header: string;
  type: FlashbarType;
}>;

describe("Flashbar", () => {
  it("renders nothing when there are no flashbar notifications", () => {
    const { container } = render(<Flashbar notifications={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it("renders multiple flashbar notifications as a stacked alert list", () => {
    render(
      <Flashbar
        notifications={[
          {
            content: "The topic is ready to review.",
            header: "Topic created.",
            id: "created",
            type: "success"
          },
          {
            action: <Button variant="outline">Retry</Button>,
            content: "Retry the request without leaving the page.",
            header: "Topics could not be loaded.",
            id: "load-failed",
            type: "error"
          }
        ]}
      />
    );

    const flashbar = screen.getByRole("region", { name: "Notifications" });

    expect(flashbar).toHaveClass("sticky", "top-1", "z-30");
    expect(within(flashbar).getByRole("list")).toBeInTheDocument();
    expect(within(flashbar).getByRole("list")).toHaveClass("gap-0.5");
    expect(within(flashbar).getAllByRole("listitem")).toHaveLength(2);
    expect(within(flashbar).getAllByRole("alert")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it.each(variantNotifications)(
    "maps the $type type to full-background status token classes",
    ({ notificationClasses, header, type }) => {
      render(
        <Flashbar
          notifications={[
            {
              content: "Flashbar body.",
              header,
              id: type,
              type
            }
          ]}
        />
      );

      const notification = screen
        .getByText(header)
        .closest("[data-slot='flashbar-notification']");
      const icon = notification?.querySelector("[data-slot='flashbar-icon']");
      const content = screen.getByText("Flashbar body.");

      expect(notification).toHaveClass(...notificationClasses);
      expect(notification?.className ?? "").not.toMatch(
        rawStatusPaletteClassPattern
      );
      expect(notification?.className ?? "").not.toMatch(
        statusTokenClassPattern
      );
      expect(icon).toHaveClass("text-current");
      expect(icon?.getAttribute("class") ?? "").not.toMatch(
        rawStatusPaletteClassPattern
      );
      expect(screen.getByText(header)).toHaveClass("font-semibold");
      expect(content).not.toHaveClass("text-muted-foreground");
    }
  );

  it("dismisses notifications from the accessible dismiss button", () => {
    render(
      <Flashbar
        notifications={[
          {
            content: "Archive the topic or keep it active.",
            dismissLabel: "Dismiss archive warning",
            header: "Topic is archived.",
            id: "archived",
            type: "warning"
          }
        ]}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Dismiss archive warning" })
    );

    expect(screen.queryByText("Topic is archived.")).not.toBeInTheDocument();
  });

  it("calls the notification dismiss handler from the dismiss button", () => {
    const handleDismiss = vi.fn();

    render(
      <Flashbar
        notifications={[
          {
            content: "Archive the topic or keep it active.",
            dismissLabel: "Dismiss archive warning",
            header: "Topic is archived.",
            id: "archived",
            onDismiss: handleDismiss,
            type: "warning"
          }
        ]}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Dismiss archive warning" })
    );

    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });
});
