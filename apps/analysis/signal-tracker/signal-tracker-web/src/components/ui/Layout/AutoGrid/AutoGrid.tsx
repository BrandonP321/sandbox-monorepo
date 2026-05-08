import type { CSSProperties } from "react";
import type * as React from "react";

import { cn } from "@/lib/utils";

import { gapClassNameBySize } from "../layout-classes";
import type { LayoutGap } from "../types";

type AutoGridNativeProps = Pick<
  React.ComponentProps<"div">,
  "children" | "className"
>;

type AutoGridMinColumnWidth = "sm" | "md" | "lg";
type AutoGridColumns = "auto" | 2;

type AutoGridProps = AutoGridNativeProps & {
  align?: "start" | "stretch";
  columns?: AutoGridColumns;
  gap?: LayoutGap;
  minColumnWidth?: AutoGridMinColumnWidth;
};

const autoGridAlignClassNameByValue = {
  start: "items-start",
  stretch: "items-stretch"
} satisfies Record<NonNullable<AutoGridProps["align"]>, string>;

const autoGridMinColumnWidthBySize = {
  sm: "12rem",
  md: "16rem",
  lg: "20rem"
} satisfies Record<AutoGridMinColumnWidth, string>;

function AutoGrid({
  align = "start",
  className,
  columns = "auto",
  gap = "md",
  minColumnWidth = "sm",
  ...autoGridProps
}: AutoGridProps) {
  const minColumnWidthValue = autoGridMinColumnWidthBySize[minColumnWidth];
  const gridStyle = {
    gridTemplateColumns:
      columns === 2
        ? `repeat(2, minmax(min(${minColumnWidthValue}, 100%), 1fr))`
        : `repeat(auto-fit, minmax(min(${minColumnWidthValue}, 100%), 1fr))`
  } satisfies CSSProperties;

  return (
    <div
      {...autoGridProps}
      data-slot="auto-grid"
      className={cn(
        "grid",
        gapClassNameBySize[gap],
        autoGridAlignClassNameByValue[align],
        className
      )}
      style={gridStyle}
    />
  );
}

export {
  AutoGrid,
  type AutoGridColumns,
  type AutoGridMinColumnWidth,
  type AutoGridProps
};
