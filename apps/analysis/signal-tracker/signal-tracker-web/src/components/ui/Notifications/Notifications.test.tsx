import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "../Button";
import {
  ErrorNotificationProvider,
  NotificationAlerts,
  NotificationFlashbar,
  NotificationProvider,
  useNotifications
} from "./index";

describe("Notifications", () => {
  it("displays success messages through the notification actions", () => {
    render(
      <NotificationProvider mode="multiple">
        <NotificationFlashbar />
        <NotificationActionButton
          label="Show success"
          onNotify={(notifications) =>
            notifications.notifySuccess({
              content: "The topic is ready to review.",
              header: "Topic created."
            })
          }
        />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Show success" }));

    const flashbar = screen.getByRole("region", { name: "Notifications" });

    expect(within(flashbar).getByRole("alert")).toHaveTextContent(
      "Topic created."
    );
    expect(
      within(flashbar).getByText("The topic is ready to review.")
    ).toBeInTheDocument();
  });

  it("dismisses notifications from the Flashbar renderer", () => {
    render(
      <NotificationProvider mode="multiple">
        <NotificationFlashbar />
        <NotificationActionButton
          label="Show warning"
          onNotify={(notifications) =>
            notifications.notifyWarning("Save changes before leaving.")
          }
        />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Show warning" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Dismiss notification" })
    );

    expect(
      screen.queryByText("Save changes before leaving.")
    ).not.toBeInTheDocument();
  });

  it("passes unsupported notification types to the parent provider", () => {
    render(
      <NotificationProvider mode="multiple">
        <NotificationFlashbar />
        <ErrorNotificationProvider>
          <NotificationAlerts />
          <NotificationActionButton
            label="Show local error"
            onNotify={(notifications) =>
              notifications.notifyError("The form could not be saved.")
            }
          />
          <NotificationActionButton
            label="Show page success"
            onNotify={(notifications) =>
              notifications.notifySuccess("The form was saved.")
            }
          />
        </ErrorNotificationProvider>
      </NotificationProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Show local error" }));

    const localAlert = screen
      .getByText("The form could not be saved.")
      .closest("[data-slot='alert']");

    expect(localAlert).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Notifications" })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Show page success" }));

    const flashbar = screen.getByRole("region", { name: "Notifications" });

    expect(
      within(flashbar).getByText("The form was saved.")
    ).toBeInTheDocument();
  });

  it("keeps only the latest notification in single-message providers", () => {
    render(
      <ErrorNotificationProvider>
        <NotificationAlerts />
        <NotificationActionButton
          label="Show first error"
          onNotify={(notifications) =>
            notifications.notifyError("The first request failed.")
          }
        />
        <NotificationActionButton
          label="Show second error"
          onNotify={(notifications) =>
            notifications.notifyError("The second request failed.")
          }
        />
      </ErrorNotificationProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Show first error" }));
    fireEvent.click(screen.getByRole("button", { name: "Show second error" }));

    expect(
      screen.queryByText("The first request failed.")
    ).not.toBeInTheDocument();
    expect(screen.getByText("The second request failed.")).toBeInTheDocument();
  });

  it("supports multiple notifications for Flashbar providers", () => {
    render(
      <NotificationProvider mode="multiple">
        <NotificationFlashbar />
        <NotificationActionButton
          label="Show success"
          onNotify={(notifications) =>
            notifications.notifySuccess("The topic was saved.")
          }
        />
        <NotificationActionButton
          label="Show warning"
          onNotify={(notifications) =>
            notifications.notifyWarning("Review citations before publishing.")
          }
        />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Show success" }));
    fireEvent.click(screen.getByRole("button", { name: "Show warning" }));

    const flashbar = screen.getByRole("region", { name: "Notifications" });

    expect(
      within(flashbar).getByText("The topic was saved.")
    ).toBeInTheDocument();
    expect(
      within(flashbar).getByText("Review citations before publishing.")
    ).toBeInTheDocument();
  });
});

type NotificationActionButtonProps = {
  label: string;
  onNotify: (notifications: ReturnType<typeof useNotifications>) => void;
};

function NotificationActionButton({
  label,
  onNotify
}: NotificationActionButtonProps) {
  const notifications = useNotifications();

  return <Button onClick={() => onNotify(notifications)}>{label}</Button>;
}
