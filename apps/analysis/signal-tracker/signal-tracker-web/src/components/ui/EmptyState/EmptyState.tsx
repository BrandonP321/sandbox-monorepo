import type { ReactNode } from "react";
import type * as React from "react";

import { cn } from "@/lib/utils";

type EmptyStateNativeProps = Pick<React.ComponentProps<"div">, "className">;

type EmptyStateProps = EmptyStateNativeProps & {
  action?: ReactNode;
  description: ReactNode;
  icon?: ReactNode;
  title: ReactNode;
};

function EmptyState({
  action,
  className,
  description,
  icon,
  title
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex min-h-24 flex-col items-center justify-center px-4 py-6 text-center",
        className
      )}
    >
      {icon ? (
        <div
          aria-hidden="true"
          data-slot="empty-state-icon"
          className="text-muted-foreground mb-3 flex items-center justify-center"
        >
          {icon}
        </div>
      ) : null}
      <p data-slot="empty-state-title" className="text-sm font-medium">
        {title}
      </p>
      <p
        data-slot="empty-state-description"
        className="text-muted-foreground mt-1 text-sm"
      >
        {description}
      </p>
      {action ? (
        <div
          data-slot="empty-state-action"
          className="mt-5 flex justify-center"
        >
          {action}
        </div>
      ) : null}
    </div>
  );
}

export { EmptyState, type EmptyStateProps };
