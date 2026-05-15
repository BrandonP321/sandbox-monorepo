import { useRef } from "react";
import type { ReactNode } from "react";
import type * as React from "react";

import { GlassButtonContent } from "./GlassButtonContent";
import {
  getGlassButtonClassName,
  type GlassButtonSize,
  type GlassButtonVariant,
  useGlassButtonAccentTracking
} from "./glassButtonShared";

type GlassButtonNativeProps = Pick<
  React.ComponentProps<"button">,
  "aria-label" | "className" | "disabled" | "onClick" | "type"
>;

type GlassButtonProps = GlassButtonNativeProps & {
  children: ReactNode;
  icon?: ReactNode;
  size?: GlassButtonSize;
  variant?: GlassButtonVariant;
};

function GlassButton({
  children,
  className,
  icon,
  size = "default",
  type = "button",
  variant = "primary",
  ...buttonProps
}: GlassButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useGlassButtonAccentTracking(buttonRef, variant);

  return (
    <button
      {...buttonProps}
      className={getGlassButtonClassName({ className, size, variant })}
      data-slot="glass-button"
      ref={buttonRef}
      type={type}
    >
      <GlassButtonContent icon={icon}>{children}</GlassButtonContent>
    </button>
  );
}

export {
  GlassButton,
  type GlassButtonProps,
  type GlassButtonSize,
  type GlassButtonVariant
};
