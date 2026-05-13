import type * as React from "react";

type ButtonNativeProps = Pick<
  React.ComponentProps<"button">,
  "aria-label" | "children" | "className" | "disabled" | "onClick" | "type"
>;

type ButtonProps = ButtonNativeProps;

function Button({ className, type = "button", ...buttonProps }: ButtonProps) {
  return (
    <button
      {...buttonProps}
      className={["portfolio-button", className].filter(Boolean).join(" ")}
      data-slot="button"
      type={type}
    />
  );
}

export { Button, type ButtonProps };
