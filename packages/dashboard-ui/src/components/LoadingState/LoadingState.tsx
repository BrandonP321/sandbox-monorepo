import type * as React from "react";

import { cn } from "../../lib/utils";

type LoadingStateNativeProps = Pick<React.ComponentProps<"div">, "className">;

type LoadingStateProps = LoadingStateNativeProps & {
  label?: string;
};

function LoadingState({ className, label = "Loading" }: LoadingStateProps) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "flex min-h-28 items-center justify-center px-4 py-7 text-center",
        className
      )}
      data-slot="loading-state"
      role="status"
    >
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className="border-muted border-t-primary size-6 animate-spin rounded-full border-[3px]"
        data-slot="loading-state-spinner"
      />
    </div>
  );
}

export { LoadingState, type LoadingStateProps };
