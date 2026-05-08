import type { LayoutGap } from "./types";

const gapClassNameBySize = {
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6"
} satisfies Record<LayoutGap, string>;

export { gapClassNameBySize };
