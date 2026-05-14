import type * as React from "react";

type GlassContainerNativeProps = Pick<
  React.ComponentProps<"div">,
  "children" | "className"
>;

type GlassContainerProps = GlassContainerNativeProps;

function GlassContainer({ className, ...containerProps }: GlassContainerProps) {
  return (
    <div
      {...containerProps}
      className={["portfolio-glass-container", className]
        .filter(Boolean)
        .join(" ")}
      data-slot="glass-container"
    />
  );
}

export { GlassContainer, type GlassContainerProps };
