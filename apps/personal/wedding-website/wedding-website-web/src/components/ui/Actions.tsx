import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { classNames } from "./classNames";

type ButtonVariant = "primary" | "quiet";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, type = "button", variant = "primary", ...props },
  ref
) {
  return (
    <button
      {...props}
      ref={ref}
      className={classNames("ui-button", className)}
      data-variant={variant}
      type={type}
    />
  );
});

type QuietLinkProps = ComponentPropsWithoutRef<"a">;

type PrimaryLinkProps = ComponentPropsWithoutRef<"a">;

const PrimaryLink = forwardRef<HTMLAnchorElement, PrimaryLinkProps>(
  function PrimaryLink({ className, ...props }, ref) {
    return (
      <a
        {...props}
        ref={ref}
        className={classNames("ui-button", className)}
        data-variant="primary"
      />
    );
  }
);

const QuietLink = forwardRef<HTMLAnchorElement, QuietLinkProps>(
  function QuietLink({ className, ...props }, ref) {
    return (
      <a
        {...props}
        ref={ref}
        className={classNames("ui-quiet-link", className)}
      />
    );
  }
);

export {
  Button,
  PrimaryLink,
  QuietLink,
  type ButtonProps,
  type ButtonVariant,
  type PrimaryLinkProps,
  type QuietLinkProps
};
