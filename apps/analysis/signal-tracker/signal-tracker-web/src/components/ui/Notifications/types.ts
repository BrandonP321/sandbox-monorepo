import type { ReactNode } from "react";

type NotificationType = "error" | "info" | "success" | "warning";

type Notification = {
  action?: ReactNode;
  content: ReactNode;
  dismissLabel?: string;
  header?: ReactNode;
  id: string;
  type: NotificationType;
};

type NotificationInput = Omit<Notification, "id"> & {
  id?: string;
};

type NotificationMessageInput =
  | ReactNode
  | (Omit<NotificationInput, "type"> & {
      content: ReactNode;
    });

type NotificationHandle = {
  dismiss: () => void;
  id: string;
};

type NotifyNotification = (
  notification: NotificationInput
) => NotificationHandle;

type NotifyNotificationMessage = (
  notification: NotificationMessageInput
) => NotificationHandle;

type NotificationActions = {
  notify: NotifyNotification;
  notifyError: NotifyNotificationMessage;
  notifyInfo: NotifyNotificationMessage;
  notifySuccess: NotifyNotificationMessage;
  notifyWarning: NotifyNotificationMessage;
};

type NotificationContextValue = NotificationActions & {
  clearNotifications: () => void;
  dismissNotification: (id: string) => void;
  notifications: readonly Notification[];
};

export type {
  Notification,
  NotificationActions,
  NotificationContextValue,
  NotificationHandle,
  NotificationInput,
  NotificationMessageInput,
  NotificationType
};
