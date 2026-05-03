import type * as React from "react";

import { cn } from "@/lib/utils";

type SkeletonProps = Pick<React.ComponentProps<"div">, "className">;

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-muted animate-pulse rounded-md", className)}
    />
  );
}

export { Skeleton, type SkeletonProps };
