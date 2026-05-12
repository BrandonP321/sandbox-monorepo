import {
  Flashbar,
  type FlashbarNotification,
  type FlashbarProps
} from "../Flashbar";
import { useNotifications } from "./useNotifications";

type NotificationFlashbarProps = Pick<FlashbarProps, "className">;

function NotificationFlashbar({ className }: NotificationFlashbarProps) {
  const { dismissNotification, notifications } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  const flashbarNotifications = notifications.map<FlashbarNotification>(
    (notification) => ({
      ...notification,
      onDismiss: () => dismissNotification(notification.id)
    })
  );

  return (
    <Flashbar className={className} notifications={flashbarNotifications} />
  );
}

export { NotificationFlashbar };
export type { NotificationFlashbarProps };
