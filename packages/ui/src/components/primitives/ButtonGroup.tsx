import type { HTMLAttributes } from "react";

import { cn } from "../../lib/cn";
import styles from "./ButtonGroup.module.scss";

const orientationClasses = {
  horizontal: styles.horizontal,
  vertical: styles.vertical
} as const;

type ButtonGroupOrientation = keyof typeof orientationClasses;

export type ButtonGroupProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: ButtonGroupOrientation;
  fullWidth?: boolean;
};

export function ButtonGroup({
  children,
  className,
  fullWidth = false,
  orientation = "horizontal",
  role = "group",
  ...props
}: ButtonGroupProps) {
  return (
    <div
      className={cn(
        styles.root,
        orientationClasses[orientation],
        fullWidth && styles.fullWidth,
        className
      )}
      data-orientation={orientation}
      role={role}
      {...props}
    >
      {children}
    </div>
  );
}

ButtonGroup.displayName = "ButtonGroup";
