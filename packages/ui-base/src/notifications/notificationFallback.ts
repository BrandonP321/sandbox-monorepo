import type { NotificationContextValue, NotificationHandle } from "./types";

const fallbackNotificationHandle: NotificationHandle = {
  dismiss: () => undefined,
  id: "unhandled-notification"
};

function notifyUnhandledNotification(): NotificationHandle {
  return fallbackNotificationHandle;
}

const fallbackNotificationContextValue: NotificationContextValue = {
  clearNotifications: () => undefined,
  dismissNotification: () => undefined,
  notifications: [],
  notify: notifyUnhandledNotification,
  notifyError: () => fallbackNotificationHandle,
  notifyInfo: () => fallbackNotificationHandle,
  notifySuccess: () => fallbackNotificationHandle,
  notifyWarning: () => fallbackNotificationHandle
};

export { fallbackNotificationContextValue };
