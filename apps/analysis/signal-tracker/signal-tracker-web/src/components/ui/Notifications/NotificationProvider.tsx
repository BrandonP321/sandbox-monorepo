import { useCallback, useContext, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";

import { NotificationContext } from "./notificationContext";
import { fallbackNotificationContextValue } from "./notificationFallback";
import { normalizeNotificationMessageInput } from "./notificationInputs";
import type {
  Notification,
  NotificationContextValue,
  NotificationInput,
  NotificationMessageInput,
  NotificationType
} from "./types";

let nextNotificationId = 0;

type NotificationProviderProps = PropsWithChildren<{
  acceptedTypes?: readonly NotificationType[];
}>;

function createNotificationId() {
  nextNotificationId += 1;
  return `notification-${nextNotificationId}`;
}

function NotificationProvider({
  acceptedTypes,
  children
}: NotificationProviderProps) {
  const parentContext = useContext(NotificationContext);
  const parentNotifications = parentContext ?? fallbackNotificationContextValue;
  const [notifications, setNotifications] = useState<readonly Notification[]>(
    []
  );
  const acceptedTypeSet = useMemo(
    () => (acceptedTypes ? new Set(acceptedTypes) : undefined),
    [acceptedTypes]
  );
  const acceptsNotificationType = useCallback(
    (type: NotificationType) =>
      acceptedTypeSet === undefined || acceptedTypeSet.has(type),
    [acceptedTypeSet]
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications((currentNotifications) =>
      currentNotifications.filter((notification) => notification.id !== id)
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const notify = useCallback(
    (notification: NotificationInput) => {
      if (!acceptsNotificationType(notification.type) && parentContext) {
        return parentNotifications.notify(notification);
      }

      const id = notification.id ?? createNotificationId();
      const nextNotification = {
        ...notification,
        id
      };

      setNotifications((currentNotifications) => [
        ...currentNotifications.filter(
          (currentNotification) => currentNotification.id !== id
        ),
        nextNotification
      ]);

      return {
        dismiss: () => dismissNotification(id),
        id
      };
    },
    [
      acceptsNotificationType,
      dismissNotification,
      parentContext,
      parentNotifications
    ]
  );

  const notifyError = useCallback(
    (notification: NotificationMessageInput) =>
      notify(normalizeNotificationMessageInput(notification, "error")),
    [notify]
  );
  const notifyInfo = useCallback(
    (notification: NotificationMessageInput) =>
      notify(normalizeNotificationMessageInput(notification, "info")),
    [notify]
  );
  const notifySuccess = useCallback(
    (notification: NotificationMessageInput) =>
      notify(normalizeNotificationMessageInput(notification, "success")),
    [notify]
  );
  const notifyWarning = useCallback(
    (notification: NotificationMessageInput) =>
      notify(normalizeNotificationMessageInput(notification, "warning")),
    [notify]
  );

  const contextValue = useMemo<NotificationContextValue>(
    () => ({
      clearNotifications,
      dismissNotification,
      notifications,
      notify,
      notifyError,
      notifyInfo,
      notifySuccess,
      notifyWarning
    }),
    [
      clearNotifications,
      dismissNotification,
      notifications,
      notify,
      notifyError,
      notifyInfo,
      notifySuccess,
      notifyWarning
    ]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export { NotificationProvider };
export type { NotificationProviderProps };
