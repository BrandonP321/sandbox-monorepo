import type { HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Menu } from "../../../icons";
import { cn } from "../../../lib/cn";
import { Icon } from "../Icon/Icon";
import { useOptionalAppShell } from "../AppShell/AppShellContext";
import styles from "./Masthead.module.scss";

type DataAttributes = {
  [key: `data-${string}`]: string | undefined;
};

type ZoneProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> &
  DataAttributes;

type MastheadSidebarToggleProps = {
  closedLabel?: string;
  icon?: LucideIcon;
  openLabel?: string;
};

export type MastheadProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "title"
> & {
  actions?: ReactNode;
  actionsProps?: ZoneProps;
  center?: ReactNode;
  centerProps?: ZoneProps;
  label?: ReactNode;
  labelProps?: ZoneProps;
  sidebarToggle?: boolean | MastheadSidebarToggleProps;
  start?: ReactNode;
  startProps?: ZoneProps;
  title?: ReactNode;
  titleProps?: ZoneProps;
};

export function Masthead({
  actions,
  actionsProps,
  center,
  centerProps,
  className,
  label,
  labelProps,
  sidebarToggle = false,
  start,
  startProps,
  title,
  titleProps,
  ...props
}: MastheadProps) {
  const appShell = useOptionalAppShell();
  const sidebarToggleOptions =
    typeof sidebarToggle === "object" ? sidebarToggle : undefined;
  const showSidebarToggle = !!sidebarToggle && !!appShell;
  const toggleLabel = appShell?.isSidebarOpen
    ? sidebarToggleOptions?.openLabel ?? "Collapse navigation"
    : sidebarToggleOptions?.closedLabel ?? "Open navigation";
  const hasLeft = !!(showSidebarToggle || start || title || label);
  const hasCenter = !!center;
  const {
    className: startClassName,
    ...restStartProps
  } = startProps ?? {};
  const {
    className: titleClassName,
    ...restTitleProps
  } = titleProps ?? {};
  const {
    className: labelClassName,
    ...restLabelProps
  } = labelProps ?? {};
  const {
    className: centerClassName,
    ...restCenterProps
  } = centerProps ?? {};
  const {
    className: actionsClassName,
    ...restActionsProps
  } = actionsProps ?? {};

  return (
    <div
      className={cn(styles.root, hasCenter && styles.hasCenter, className)}
      {...props}
    >
      {hasLeft ? (
        <div className={styles.left}>
          {showSidebarToggle ? (
            <button
              aria-controls={appShell.sidebarId}
              aria-expanded={appShell.isSidebarOpen}
              aria-label={toggleLabel}
              className={styles.controlButton}
              title={toggleLabel}
              type="button"
              onClick={appShell.toggleSidebar}
            >
              <Icon icon={sidebarToggleOptions?.icon ?? Menu} size="sm" />
            </button>
          ) : null}
          {start ? (
            <div className={cn(styles.start, startClassName)} {...restStartProps}>
              {start}
            </div>
          ) : null}
          {title || label ? (
            <div className={styles.titleBlock}>
              {label ? (
                <div className={cn(styles.label, labelClassName)} {...restLabelProps}>
                  {label}
                </div>
              ) : null}
              {title ? (
                <div className={cn(styles.title, titleClassName)} {...restTitleProps}>
                  {title}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
      {center ? (
        <div className={cn(styles.center, centerClassName)} {...restCenterProps}>
          {center}
        </div>
      ) : null}
      {actions ? (
        <div className={cn(styles.actions, actionsClassName)} {...restActionsProps}>
          {actions}
        </div>
      ) : null}
    </div>
  );
}

Masthead.displayName = "Masthead";
