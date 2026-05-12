import { cva, type VariantProps } from "class-variance-authority";
import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
  X,
  type LucideIcon
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type * as React from "react";

import { cn } from "@/lib/utils";

type FlashbarType = "error" | "info" | "success" | "warning";

type FlashbarNotification = {
  action?: ReactNode;
  content: ReactNode;
  dismissLabel?: string;
  header?: ReactNode;
  id: string;
  onDismiss?: () => void;
  type?: FlashbarType;
};

type FlashbarNativeProps = Pick<
  React.ComponentProps<"section">,
  "aria-label" | "className"
>;

type FlashbarProps = FlashbarNativeProps & {
  notifications: readonly FlashbarNotification[];
};

const flashbarNotificationVariants = cva(
  "grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 rounded-xl px-4 py-3 text-sm shadow-xs",
  {
    variants: {
      type: {
        error: "bg-danger text-danger-foreground",
        info: "bg-info text-white",
        success: "bg-success text-white",
        warning: "bg-warning text-foreground"
      }
    },
    defaultVariants: {
      type: "info"
    }
  }
);

const flashbarIconClassName = "mt-0.5 size-5 shrink-0 text-current";

type ResolvedFlashbarType = NonNullable<
  VariantProps<typeof flashbarNotificationVariants>["type"]
>;

const flashbarIconByType = {
  error: CircleAlert,
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert
} satisfies Record<ResolvedFlashbarType, LucideIcon>;

function Flashbar({
  "aria-label": ariaLabel = "Notifications",
  className,
  notifications
}: FlashbarProps) {
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<
    ReadonlySet<string>
  >(() => new Set());
  const visibleNotifications = useMemo(
    () =>
      notifications.filter(
        (notification) => !dismissedNotificationIds.has(notification.id)
      ),
    [dismissedNotificationIds, notifications]
  );

  useEffect(() => {
    const currentNotificationIds = new Set(
      notifications.map((notification) => notification.id)
    );

    setDismissedNotificationIds((previousIds) => {
      const nextIds = new Set(
        [...previousIds].filter((id) => currentNotificationIds.has(id))
      );

      return nextIds.size === previousIds.size ? previousIds : nextIds;
    });
  }, [notifications]);

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <section
      aria-label={ariaLabel}
      data-slot="flashbar"
      className={cn("sticky top-1 w-full", className)}
    >
      <ul data-slot="flashbar-list" className="grid gap-0.5">
        {visibleNotifications.map((notification) => {
          const type = notification.type ?? "info";
          const Icon = flashbarIconByType[type];

          return (
            <li data-slot="flashbar-list-item" key={notification.id}>
              <div
                data-slot="flashbar-notification"
                role="alert"
                className={flashbarNotificationVariants({ type })}
              >
                <Icon
                  aria-hidden="true"
                  data-slot="flashbar-icon"
                  className={flashbarIconClassName}
                />
                <div className="min-w-0">
                  {notification.header ? (
                    <p
                      data-slot="flashbar-header"
                      className="font-semibold leading-5"
                    >
                      {notification.header}
                    </p>
                  ) : null}
                  <div
                    data-slot="flashbar-content"
                    className={cn(
                      "leading-5",
                      notification.header ? "mt-0.5" : undefined
                    )}
                  >
                    {notification.content}
                  </div>
                  {notification.action ? (
                    <div
                      data-slot="flashbar-action"
                      className="mt-3 flex flex-wrap items-center gap-2"
                    >
                      {notification.action}
                    </div>
                  ) : null}
                </div>
                <button
                  aria-label={
                    notification.dismissLabel ?? "Dismiss notification"
                  }
                  className="-m-1 flex size-7 shrink-0 items-center justify-center rounded-md text-current opacity-80 transition hover:bg-white/20 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:outline-none"
                  onClick={() => {
                    setDismissedNotificationIds((previousIds) =>
                      new Set(previousIds).add(notification.id)
                    );
                    notification.onDismiss?.();
                  }}
                  type="button"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export {
  Flashbar,
  type FlashbarNotification,
  type FlashbarProps,
  type FlashbarType
};
