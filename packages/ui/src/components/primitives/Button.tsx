import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "../../lib/cn";
import { Icon } from "./Icon";
import styles from "./Button.module.scss";

const variantClasses = {
  primary: styles.primary,
  secondary: styles.secondary
} as const;

const sizeClasses = {
  sm: styles.sm,
  md: styles.md
} as const;

type ButtonVariant = keyof typeof variantClasses;
type ButtonSize = keyof typeof sizeClasses;

const iconSizeByButtonSize = {
  sm: "sm",
  md: "md"
} as const;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  iconLeft?: LucideIcon;
  iconRight?: LucideIcon;
};

export function Button({
  children,
  className,
  iconLeft,
  iconRight,
  type = "button",
  variant = "secondary",
  size = "md",
  fullWidth = false,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        styles.root,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && styles.fullWidth,
        className
      )}
      type={type}
      {...props}
    >
      {iconLeft ? (
        <span className={styles.icon}>
          <Icon icon={iconLeft} size={iconSizeByButtonSize[size]} />
        </span>
      ) : null}
      {children ? <span className={styles.label}>{children}</span> : null}
      {iconRight ? (
        <span className={styles.icon}>
          <Icon icon={iconRight} size={iconSizeByButtonSize[size]} />
        </span>
      ) : null}
    </button>
  );
}

Button.displayName = "Button";
