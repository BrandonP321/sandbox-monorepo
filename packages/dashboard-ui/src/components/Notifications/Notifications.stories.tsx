import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ErrorNotificationProvider,
  NotificationProvider,
  useNotifications
} from "@repo/ui-base/notifications";

import { Button } from "../Button";
import { NotificationAlerts, NotificationFlashbar } from "./index";

const meta = {
  title: "UI/Notifications",
  decorators: [
    (Story) => (
      <div className="w-full max-w-3xl">
        <Story />
      </div>
    )
  ]
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const RootFlashbar: Story = {
  render: () => (
    <NotificationProvider mode="multiple">
      <NotificationDemoControls />
      <div className="mt-4">
        <NotificationFlashbar />
      </div>
    </NotificationProvider>
  )
};

export const NestedAlertBoundary: Story = {
  render: () => (
    <NotificationProvider mode="multiple">
      <div className="grid gap-4">
        <NotificationFlashbar />
        <ErrorNotificationProvider>
          <div className="border-border bg-card grid gap-4 rounded-xl border p-4">
            <NotificationAlerts />
            <NotificationDemoControls />
          </div>
        </ErrorNotificationProvider>
      </div>
    </NotificationProvider>
  )
};

function NotificationDemoControls() {
  const { notifyError, notifyInfo, notifySuccess, notifyWarning } =
    useNotifications();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        onClick={() =>
          notifySuccess({
            content: "The topic is available in the active topic list.",
            header: "Topic created."
          })
        }
      >
        Success
      </Button>
      <Button
        onClick={() =>
          notifyInfo("Evidence can be attached after the topic has context.")
        }
      >
        Info
      </Button>
      <Button
        onClick={() =>
          notifyWarning("Save or discard edits before leaving this view.")
        }
      >
        Warning
      </Button>
      <Button
        onClick={() =>
          notifyError({
            content: "Resolve the API error before trying again.",
            header: "Topics could not be loaded."
          })
        }
      >
        Error
      </Button>
    </div>
  );
}
