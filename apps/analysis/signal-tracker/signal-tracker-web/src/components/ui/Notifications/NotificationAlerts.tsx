import { Alert } from "../Alert";
import { useNotifications } from "./useNotifications";
import type { NotificationType } from "./types";

const alertVariantByNotificationType = {
  error: "danger",
  info: "info",
  success: "success",
  warning: "warning"
} satisfies Record<NotificationType, "danger" | "info" | "success" | "warning">;

function NotificationAlerts() {
  const { notifications } = useNotifications();
  const latestNotification = notifications.at(-1);

  if (!latestNotification) {
    return null;
  }

  return (
    <div data-slot="notification-alerts" className="grid gap-2">
      <Alert
        actions={latestNotification.action}
        title={latestNotification.header}
        variant={alertVariantByNotificationType[latestNotification.type]}
      >
        {latestNotification.content}
      </Alert>
    </div>
  );
}

export { NotificationAlerts };
