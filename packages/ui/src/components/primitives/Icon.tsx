import type { LucideIcon, LucideProps } from "lucide-react";

import { cn } from "../../lib/cn";
import styles from "./Icon.module.scss";

const sizeClasses = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg
} as const;

type IconSize = keyof typeof sizeClasses;

export type IconProps = Omit<LucideProps, "size"> & {
  icon: LucideIcon;
  size?: IconSize;
};

export function Icon({
  className,
  icon: IconGlyph,
  size = "md",
  strokeWidth,
  ...props
}: IconProps) {
  return (
    <IconGlyph
      aria-hidden="true"
      className={cn(styles.root, sizeClasses[size], className)}
      focusable="false"
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}

Icon.displayName = "Icon";
