import type * as React from "react";

type ActionsContainerNativeProps = Pick<
  React.ComponentProps<"div">,
  "aria-label" | "children" | "className"
>;

type ActionsContainerProps = ActionsContainerNativeProps;

function ActionsContainer({
  className,
  ...containerProps
}: ActionsContainerProps) {
  return (
    <div
      {...containerProps}
      className={["portfolio-actions-container", className]
        .filter(Boolean)
        .join(" ")}
      data-slot="actions-container"
    />
  );
}

export { ActionsContainer, type ActionsContainerProps };
