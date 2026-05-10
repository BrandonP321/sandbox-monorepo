import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import type { ReactNode } from "react";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[background-color,border-color,color,box-shadow] disabled:pointer-events-none disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none aria-invalid:border-danger aria-invalid:ring-danger/20 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:shadow-sm",
        danger:
          "bg-danger text-danger-foreground shadow-xs hover:bg-danger/90 hover:shadow-sm",
        outline:
          "border border-input bg-card text-foreground shadow-xs hover:border-ring/30 hover:bg-accent/60 hover:text-accent-foreground",
        secondary:
          "border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground",
        link: "h-auto rounded-md px-0 text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-lg px-6",
        icon: "size-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>["variant"]
>;
type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

type ButtonNativeProps = Pick<
  React.ComponentProps<"button">,
  "aria-label" | "children" | "className" | "disabled" | "onClick" | "type"
>;

type ButtonVisualProps = {
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  isLoading?: boolean;
  loadingLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type ButtonProps = ButtonNativeProps & ButtonVisualProps;

type ButtonAnchorNativeProps = Pick<
  React.ComponentPropsWithoutRef<"a">,
  | "aria-busy"
  | "aria-current"
  | "aria-disabled"
  | "aria-label"
  | "children"
  | "className"
  | "href"
  | "onBlur"
  | "onClick"
  | "onFocus"
  | "onMouseEnter"
  | "onMouseLeave"
  | "onTouchStart"
  | "rel"
  | "role"
  | "style"
  | "target"
> & {
  "data-status"?: string;
  "data-transitioning"?: string;
  disabled?: boolean;
};

type ButtonAnchorProps = Omit<
  ButtonAnchorNativeProps,
  "children" | "className"
> &
  ButtonVisualProps &
  Pick<ButtonAnchorNativeProps, "children" | "className">;

function Button({
  className,
  children,
  disabled,
  iconLeft,
  iconRight,
  isLoading = false,
  loadingLabel,
  size = "default",
  type = "button",
  variant = "default",
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      {...buttonProps}
      aria-busy={isLoading ? true : undefined}
      data-slot="button"
      disabled={disabled || isLoading}
      className={cn(buttonVariants({ variant, size, className }))}
      type={type}
    >
      <ButtonContent
        iconLeft={iconLeft}
        iconRight={iconRight}
        isLoading={isLoading}
        loadingLabel={loadingLabel}
      >
        {children}
      </ButtonContent>
    </button>
  );
}

const ButtonAnchor = forwardRef<HTMLAnchorElement, ButtonAnchorProps>(
  function ButtonAnchor(
    {
      "aria-disabled": ariaDisabled,
      className,
      children,
      disabled,
      iconLeft,
      iconRight,
      isLoading = false,
      loadingLabel,
      size = "default",
      variant = "default",
      ...anchorProps
    },
    ref
  ) {
    const isDisabled = disabled || isLoading;

    return (
      <a
        {...anchorProps}
        aria-busy={isLoading ? true : undefined}
        aria-disabled={isDisabled ? true : ariaDisabled}
        data-slot="button-link"
        ref={ref}
        className={cn(
          buttonVariants({ variant, size, className }),
          isDisabled ? "pointer-events-none opacity-50" : undefined
        )}
      >
        <ButtonContent
          iconLeft={iconLeft}
          iconRight={iconRight}
          isLoading={isLoading}
          loadingLabel={loadingLabel}
        >
          {children}
        </ButtonContent>
      </a>
    );
  }
);

type ButtonContentProps = Pick<
  ButtonVisualProps,
  "iconLeft" | "iconRight" | "isLoading" | "loadingLabel"
> &
  Pick<React.ComponentProps<"span">, "children">;

function ButtonContent({
  children,
  iconLeft,
  iconRight,
  isLoading = false,
  loadingLabel
}: ButtonContentProps) {
  const content = isLoading ? (loadingLabel ?? children) : children;
  const shouldRenderIcons = !isLoading || loadingLabel === undefined;

  return (
    <>
      {shouldRenderIcons ? iconLeft : null}
      {content}
      {shouldRenderIcons ? iconRight : null}
    </>
  );
}

export {
  Button,
  ButtonAnchor,
  type ButtonAnchorProps,
  type ButtonProps,
  type ButtonVisualProps
};
