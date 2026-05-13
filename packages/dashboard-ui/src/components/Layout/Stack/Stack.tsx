import type * as React from "react";

import { cn } from "../../../lib/utils";

import { gapClassNameBySize } from "../layout-classes";
import type { LayoutGap } from "../types";

type StackNativeProps = Pick<
  React.ComponentProps<"div">,
  "children" | "className"
>;

type StackProps = StackNativeProps & {
  gap?: LayoutGap;
};

function Stack({ className, gap = "md", ...stackProps }: StackProps) {
  return (
    <div
      {...stackProps}
      data-slot="stack"
      className={cn("grid", gapClassNameBySize[gap], className)}
    />
  );
}

export { Stack, type StackProps };
