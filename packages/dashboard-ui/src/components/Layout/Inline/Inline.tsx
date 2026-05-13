import type * as React from "react";

import { cn } from "../../../lib/utils";

import { gapClassNameBySize } from "../layout-classes";
import type { LayoutGap } from "../types";

type InlineNativeProps = Pick<
  React.ComponentProps<"div">,
  "children" | "className"
>;

type InlineAlign = "start" | "center" | "end" | "baseline" | "stretch";
type InlineJustify = "start" | "center" | "end" | "between";

type InlineProps = InlineNativeProps & {
  align?: InlineAlign;
  gap?: LayoutGap;
  justify?: InlineJustify;
  wrap?: boolean;
};

const inlineAlignClassNameByValue = {
  baseline: "items-baseline",
  center: "items-center",
  end: "items-end",
  start: "items-start",
  stretch: "items-stretch"
} satisfies Record<InlineAlign, string>;

const inlineJustifyClassNameByValue = {
  between: "justify-between",
  center: "justify-center",
  end: "justify-end",
  start: "justify-start"
} satisfies Record<InlineJustify, string>;

function Inline({
  align = "center",
  className,
  gap = "sm",
  justify = "start",
  wrap = true,
  ...inlineProps
}: InlineProps) {
  return (
    <div
      {...inlineProps}
      data-slot="inline"
      className={cn(
        "flex",
        wrap ? "flex-wrap" : "flex-nowrap",
        gapClassNameBySize[gap],
        inlineAlignClassNameByValue[align],
        inlineJustifyClassNameByValue[justify],
        className
      )}
    />
  );
}

export { Inline, type InlineAlign, type InlineJustify, type InlineProps };
