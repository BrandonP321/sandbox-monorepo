import type { ReactNode } from "react";
import type * as React from "react";

import { cn } from "@/lib/utils";

type WithAsideNativeProps = Pick<
  React.ComponentProps<"div">,
  "children" | "className"
>;

type WithAsideWidth = "sm" | "md" | "lg";

type WithAsideProps = WithAsideNativeProps & {
  aside: ReactNode;
  asideClassName?: string;
  asideWidth?: WithAsideWidth;
  mainClassName?: string;
  stickyAside?: boolean;
};

const withAsideClassNameByWidth = {
  sm: "lg:grid-cols-[minmax(0,1fr)_16rem]",
  md: "lg:grid-cols-[minmax(0,1fr)_20rem]",
  lg: "lg:grid-cols-[minmax(0,1fr)_24rem]"
} satisfies Record<WithAsideWidth, string>;

function WithAside({
  aside,
  asideClassName,
  asideWidth = "md",
  children,
  className,
  mainClassName,
  stickyAside = false
}: WithAsideProps) {
  return (
    <div
      data-slot="with-aside"
      className={cn(
        "grid gap-4 lg:items-start",
        withAsideClassNameByWidth[asideWidth],
        className
      )}
    >
      <aside
        data-slot="with-aside-aside"
        className={cn(
          "lg:col-start-2 lg:row-start-1",
          stickyAside ? "lg:sticky lg:top-6" : undefined,
          asideClassName
        )}
      >
        {aside}
      </aside>
      <div
        data-slot="with-aside-main"
        className={cn("lg:col-start-1 lg:row-start-1", mainClassName)}
      >
        {children}
      </div>
    </div>
  );
}

export { WithAside, type WithAsideProps, type WithAsideWidth };
