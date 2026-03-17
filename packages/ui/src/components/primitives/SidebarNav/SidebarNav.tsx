import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode
} from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "../../../lib/cn";
import { useOptionalAppShell } from "../AppShell/AppShellContext";
import { Icon } from "../Icon/Icon";
import styles from "./SidebarNav.module.scss";

const modeClasses = {
  expanded: styles.expanded,
  collapsed: styles.collapsed,
  overlay: styles.overlay
} as const;

type SidebarNavMode = keyof typeof modeClasses;

type BaseItem = {
  active?: boolean;
  ariaLabel?: string;
  disabled?: boolean;
  icon?: LucideIcon;
  label: ReactNode;
};

type SidebarNavActionItem = BaseItem & {
  href?: never;
  onSelect: MouseEventHandler<HTMLButtonElement>;
  rel?: never;
  target?: never;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
};

type SidebarNavLinkItem = BaseItem & {
  href: string;
  onSelect?: never;
  rel?: AnchorHTMLAttributes<HTMLAnchorElement>["rel"];
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  type?: never;
};

export type SidebarNavChildItem =
  | SidebarNavActionItem
  | SidebarNavLinkItem;

export type SidebarNavItem =
  | (SidebarNavActionItem & {
      children?: readonly SidebarNavChildItem[];
    })
  | (SidebarNavLinkItem & {
      children?: readonly SidebarNavChildItem[];
    });

export type SidebarNavSection = {
  items: readonly SidebarNavItem[];
  label?: ReactNode;
};

export type SidebarNavProps = Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> & {
  footer?: ReactNode;
  mode?: SidebarNavMode;
  open?: boolean;
  sections: readonly SidebarNavSection[];
};

function getAccessibleLabel(item: BaseItem): string | undefined {
  if (item.ariaLabel) {
    return item.ariaLabel;
  }

  return typeof item.label === "string" ? item.label : undefined;
}

function itemHasActiveChild(item: SidebarNavItem): boolean {
  return item.children?.some((child) => child.active) ?? false;
}

function renderItemContent(item: BaseItem, mode: SidebarNavMode) {
  const accessibleLabel = getAccessibleLabel(item);

  return (
    <>
      {item.icon ? (
        <span className={styles.icon}>
          <Icon icon={item.icon} size="sm" />
        </span>
      ) : null}
      <span className={styles.label} aria-hidden={mode === "collapsed"}>
        {item.label}
      </span>
      {mode === "collapsed" && accessibleLabel ? (
        <span className={styles.srOnly}>{accessibleLabel}</span>
      ) : null}
    </>
  );
}

function renderLeafItem(
  item: SidebarNavItem | SidebarNavChildItem,
  mode: SidebarNavMode,
  level: 1 | 2
) {
  const commonClassName = cn(
    styles.itemControl,
    level === 2 && styles.childControl,
    item.active && styles.active,
    item.disabled && styles.disabled
  );
  const accessibleLabel = getAccessibleLabel(item);

  if ("href" in item) {
    return (
      <a
        aria-current={item.active ? "page" : undefined}
        aria-disabled={item.disabled ? true : undefined}
        className={commonClassName}
        href={item.disabled ? undefined : item.href}
        rel={item.rel}
        tabIndex={item.disabled ? -1 : undefined}
        target={item.target}
        title={mode === "collapsed" ? accessibleLabel : undefined}
      >
        {renderItemContent(item, mode)}
      </a>
    );
  }

  return (
    <button
      aria-current={item.active ? "page" : undefined}
      aria-label={mode === "collapsed" ? accessibleLabel : undefined}
      className={commonClassName}
      disabled={item.disabled}
      title={mode === "collapsed" ? accessibleLabel : undefined}
      type={item.type ?? "button"}
      onClick={item.onSelect}
    >
      {renderItemContent(item, mode)}
    </button>
  );
}

function renderTopLevelItem(item: SidebarNavItem, mode: SidebarNavMode, key: string) {
  const activeTrail = itemHasActiveChild(item);

  return (
    <li className={styles.item} key={key}>
      {renderLeafItem(
        {
          ...item,
          active: item.active || activeTrail
        },
        mode,
        1
      )}
      {mode !== "collapsed" && item.children?.length ? (
        <ul className={styles.childList}>
          {item.children.map((child, childIndex) => (
            <li className={styles.childItem} key={`${key}-child-${childIndex}`}>
              {renderLeafItem(child, mode, 2)}
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function SidebarNav({
  className,
  footer,
  id,
  mode,
  open,
  sections,
  ...props
}: SidebarNavProps) {
  const appShell = useOptionalAppShell();
  const resolvedMode =
    mode ?? (appShell?.sidebarMode === "overlay" ? "overlay" : "expanded");
  const resolvedOpen = open ?? (appShell ? appShell.isSidebarOpen : true);
  const resolvedId = id ?? appShell?.sidebarId;

  return (
    <nav
      aria-hidden={resolvedMode === "overlay" && !resolvedOpen ? true : undefined}
      className={cn(
        styles.root,
        modeClasses[resolvedMode],
        resolvedMode === "overlay" && !resolvedOpen && styles.overlayClosed,
        className
      )}
      data-mode={resolvedMode}
      id={resolvedId}
      {...props}
    >
      <div className={styles.body}>
        {sections.map((section, sectionIndex) => (
          <section className={styles.section} key={`section-${sectionIndex}`}>
            {section.label && resolvedMode !== "collapsed" ? (
              <div className={styles.sectionLabel}>{section.label}</div>
            ) : null}
            <ul className={styles.list}>
              {section.items.map((item, itemIndex) =>
                renderTopLevelItem(
                  item,
                  resolvedMode,
                  `${sectionIndex}-${itemIndex}`
                )
              )}
            </ul>
          </section>
        ))}
      </div>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </nav>
  );
}

SidebarNav.displayName = "SidebarNav";
