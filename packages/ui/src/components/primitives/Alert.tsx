import type { HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { AlertCircle } from "../../icons";
import { cn } from "../../lib/cn";
import { Icon } from "./Icon";
import styles from "./Alert.module.scss";

const toneClasses = {
  info: styles.info,
  success: styles.success,
  warning: styles.warning,
  danger: styles.danger
} as const;

type AlertTone = keyof typeof toneClasses;

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  tone?: AlertTone;
  title?: ReactNode;
  icon?: LucideIcon | false;
};

export function Alert({
  children,
  className,
  icon = AlertCircle,
  role = "alert",
  title,
  tone = "info",
  ...props
}: AlertProps) {
  return (
    <div
      className={cn(styles.root, toneClasses[tone], !icon && styles.noIcon, className)}
      role={role}
      {...props}
    >
      {icon ? (
        <span className={styles.icon}>
          <Icon icon={icon} />
        </span>
      ) : null}
      {(title || children) ? (
        <div className={styles.body}>
          {title ? <div className={styles.title}>{title}</div> : null}
          {children ? <div className={styles.message}>{children}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

Alert.displayName = "Alert";
