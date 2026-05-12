import { useContext } from "react";

import { NotificationContext } from "./notificationContext";
import { fallbackNotificationContextValue } from "./notificationFallback";

function useNotifications() {
  return useContext(NotificationContext) ?? fallbackNotificationContextValue;
}

export { useNotifications };
