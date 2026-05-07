import type * as React from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ChipNativeProps = Pick<
  React.ComponentProps<"span">,
  "aria-label" | "children" | "className" | "title"
>;

type ChipProps = ChipNativeProps & {
  iconLeft?: ReactNode;
};

function Chip({ children, className, iconLeft, ...chipProps }: ChipProps) {
  return (
    <span
      {...chipProps}
      className={cn(
        "border-border bg-background text-foreground inline-flex max-w-full items-center gap-2 rounded-full border px-2.5 py-1.5 text-sm shadow-xs",
        className
      )}
      data-slot="chip"
    >
      {iconLeft ? (
        <span
          className="bg-muted text-muted-foreground flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full"
          data-slot="chip-icon"
        >
          {iconLeft}
        </span>
      ) : null}
      <span className="truncate font-medium" data-slot="chip-label">
        {children}
      </span>
    </span>
  );
}

export { Chip, type ChipProps };
