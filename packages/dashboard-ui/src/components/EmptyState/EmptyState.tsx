import type { ReactNode } from "react";
import type * as React from "react";

import { cn } from "../../lib/utils";

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
        "flex min-h-28 flex-col items-center justify-center px-4 py-7 text-center",
        className
      )}
    >
      {icon ? (
        <div
          aria-hidden="true"
          data-slot="empty-state-icon"
          className="bg-accent/70 text-accent-foreground mb-3 flex size-12 items-center justify-center rounded-full [&_svg]:size-6"
        >
          {icon}
        </div>
      ) : null}
      <p
        data-slot="empty-state-title"
        className="text-foreground text-sm font-semibold"
      >
        {title}
      </p>
      <p
        data-slot="empty-state-description"
        className="text-muted-foreground mt-1.5 max-w-sm text-sm leading-5"
      >
        {description}
      </p>
      {action ? (
        <div
          data-slot="empty-state-action"
          className="mt-5 flex flex-wrap justify-center gap-2"
        >
          {action}
        </div>
      ) : null}
    </div>
  );
}

export { EmptyState, type EmptyStateProps };
