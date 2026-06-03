import { useEffect } from "react";
import { useNotifications } from "@repo/ui-base/notifications";

import {
  persistenceRetryNotificationAcknowledged,
  selectPendingPersistenceRetryNotification
} from "@/api/persistenceRetry";
import { useAppDispatch, useAppSelector } from "@/storeHooks";

const persistenceRetryNotificationId = "signal-tracker-persistence-retry";
const persistenceRetryNotificationContent =
  "The database is starting after being inactive. This request is being retried automatically. Refresh the page if this does not resolve in 30-60 seconds.";

function PersistenceRetryNotificationBridge() {
  const dispatch = useAppDispatch();
  const { notifyInfo } = useNotifications();
  const notification = useAppSelector(
    selectPendingPersistenceRetryNotification
  );

  useEffect(() => {
    if (!notification) {
      return;
    }

    notifyInfo({
      content: persistenceRetryNotificationContent,
      header: "Database is starting",
      id: persistenceRetryNotificationId
    });
    dispatch(persistenceRetryNotificationAcknowledged(notification.id));
  }, [dispatch, notification, notifyInfo]);

  return null;
}

export { PersistenceRetryNotificationBridge };
