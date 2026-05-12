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

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div data-slot="notification-alerts" className="grid gap-2">
      {notifications.map((notification) => (
        <Alert
          actions={notification.action}
          key={notification.id}
          title={notification.header}
          variant={alertVariantByNotificationType[notification.type]}
        >
          {notification.content}
        </Alert>
      ))}
    </div>
  );
}

export { NotificationAlerts };
