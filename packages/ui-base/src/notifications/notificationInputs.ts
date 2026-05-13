import type {
  NotificationInput,
  NotificationMessageInput,
  NotificationType
} from "./types";

function normalizeNotificationMessageInput(
  notification: NotificationMessageInput,
  type: NotificationType
): NotificationInput {
  if (
    typeof notification === "object" &&
    notification !== null &&
    "content" in notification
  ) {
    return {
      ...notification,
      type
    };
  }

  return {
    content: notification,
    type
  };
}

export { normalizeNotificationMessageInput };
