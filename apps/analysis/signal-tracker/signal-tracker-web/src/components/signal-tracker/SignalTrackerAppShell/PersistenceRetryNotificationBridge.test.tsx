import { act, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";
import { NotificationProvider } from "@repo/ui-base/notifications";

import {
  persistenceRetryScheduled,
  selectPendingPersistenceRetryNotification
} from "@/api/persistenceRetry";
import { NotificationFlashbar } from "@/components/ui";
import { makeStore } from "@/store";

import { PersistenceRetryNotificationBridge } from "./PersistenceRetryNotificationBridge";

describe("PersistenceRetryNotificationBridge", () => {
  it("posts an info flashbar when storage retries are scheduled", async () => {
    const store = makeStore();

    render(
      <Provider store={store}>
        <NotificationProvider mode="multiple">
          <NotificationFlashbar />
          <PersistenceRetryNotificationBridge />
        </NotificationProvider>
      </Provider>
    );

    await act(async () => {
      store.dispatch(
        persistenceRetryScheduled({
          attempt: 1,
          endpointName: "createTopic",
          requestType: "mutation"
        })
      );
    });

    expect(screen.getByRole("alert")).toHaveTextContent("Database is starting");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "The database is starting after being inactive. This request is being retried automatically. Refresh the page if this does not resolve in 30-60 seconds."
    );
    expect(selectPendingPersistenceRetryNotification(store.getState())).toBe(
      undefined
    );
  });
});
