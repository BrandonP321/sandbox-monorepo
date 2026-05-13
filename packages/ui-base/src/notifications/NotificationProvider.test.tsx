// @vitest-environment jsdom
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ErrorNotificationProvider,
  NotificationProvider,
  useNotifications,
  type NotificationActions
} from "./index";

describe("NotificationProvider", () => {
  it("keeps only the latest notification in single-message providers", () => {
    render(
      <ErrorNotificationProvider>
        <NotificationList label="Local notifications" />
        <NotifyButton
          label="Show first error"
          onNotify={({ notifyError }) =>
            notifyError("The first request failed.")
          }
        />
        <NotifyButton
          label="Show second error"
          onNotify={({ notifyError }) =>
            notifyError("The second request failed.")
          }
        />
      </ErrorNotificationProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Show first error" }));
    fireEvent.click(screen.getByRole("button", { name: "Show second error" }));

    expect(screen.queryByText("The first request failed.")).toBeNull();
    expect(screen.getByText("The second request failed.")).toBeTruthy();
  });

  it("keeps multiple notifications when configured for stacking", () => {
    render(
      <NotificationProvider mode="multiple">
        <NotificationList label="Root notifications" />
        <NotifyButton
          label="Show success"
          onNotify={({ notifySuccess }) =>
            notifySuccess("The topic was saved.")
          }
        />
        <NotifyButton
          label="Show warning"
          onNotify={({ notifyWarning }) =>
            notifyWarning("Review citations before publishing.")
          }
        />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Show success" }));
    fireEvent.click(screen.getByRole("button", { name: "Show warning" }));

    const rootNotifications = screen.getByRole("region", {
      name: "Root notifications"
    });

    expect(
      within(rootNotifications).getByText("The topic was saved.")
    ).toBeTruthy();
    expect(
      within(rootNotifications).getByText("Review citations before publishing.")
    ).toBeTruthy();
  });

  it("dismisses notifications by id", () => {
    render(
      <NotificationProvider mode="multiple">
        <NotificationList label="Root notifications" />
        <NotifyButton
          label="Show warning"
          onNotify={({ notifyWarning }) =>
            notifyWarning("Save changes before leaving.")
          }
        />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Show warning" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Dismiss Save changes before leaving."
      })
    );

    expect(screen.queryByText("Save changes before leaving.")).toBeNull();
  });

  it("passes unsupported notification types to the parent provider", () => {
    render(
      <NotificationProvider mode="multiple">
        <NotificationList label="Root notifications" />
        <ErrorNotificationProvider>
          <NotificationList label="Local notifications" />
          <NotifyButton
            label="Show local error"
            onNotify={({ notifyError }) =>
              notifyError("The form could not be saved.")
            }
          />
          <NotifyButton
            label="Show page success"
            onNotify={({ notifySuccess }) =>
              notifySuccess("The form was saved.")
            }
          />
        </ErrorNotificationProvider>
      </NotificationProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Show local error" }));
    fireEvent.click(screen.getByRole("button", { name: "Show page success" }));

    expect(
      within(
        screen.getByRole("region", { name: "Local notifications" })
      ).getByText("The form could not be saved.").textContent
    ).toBe("The form could not be saved.");
    expect(
      within(
        screen.getByRole("region", { name: "Root notifications" })
      ).getByText("The form was saved.").textContent
    ).toBe("The form was saved.");
  });

  it("clears only the nearest provider", () => {
    render(
      <NotificationProvider mode="multiple">
        <NotificationList label="Root notifications" />
        <NotifyButton
          label="Show root success"
          onNotify={({ notifySuccess }) =>
            notifySuccess("The page-level save completed.")
          }
        />
        <ErrorNotificationProvider>
          <NotificationList label="Local notifications" />
          <NotifyButton
            label="Show local error"
            onNotify={({ notifyError }) =>
              notifyError("The local save failed.")
            }
          />
          <ClearNotificationsButton label="Clear local notifications" />
        </ErrorNotificationProvider>
      </NotificationProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Show root success" }));
    fireEvent.click(screen.getByRole("button", { name: "Show local error" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Clear local notifications" })
    );

    expect(
      within(
        screen.getByRole("region", { name: "Root notifications" })
      ).getByText("The page-level save completed.").textContent
    ).toBe("The page-level save completed.");
    expect(screen.queryByText("The local save failed.")).toBeNull();
  });
});

type NotifyButtonProps = {
  label: string;
  onNotify: (notifications: NotificationActions) => void;
};

function NotifyButton({ label, onNotify }: NotifyButtonProps) {
  const notifications = useNotifications();

  return <button onClick={() => onNotify(notifications)}>{label}</button>;
}

function ClearNotificationsButton({ label }: { label: string }) {
  const { clearNotifications } = useNotifications();

  return <button onClick={clearNotifications}>{label}</button>;
}

function NotificationList({ label }: { label: string }) {
  const { dismissNotification, notifications } = useNotifications();

  return (
    <section aria-label={label}>
      <ul>
        {notifications.map((notification) => (
          <li key={notification.id}>
            <span>{notification.content}</span>
            <button onClick={() => dismissNotification(notification.id)}>
              Dismiss {notification.content}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
