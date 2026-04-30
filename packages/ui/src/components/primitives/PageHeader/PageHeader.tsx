import type { HTMLAttributes, ReactNode } from "react";

import styles from "./PageHeader.module.scss";

export type PageHeaderProps = Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "className" | "title"
> & {
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
  tools?: ReactNode;
};

export function PageHeader({
  actions,
  breadcrumbs,
  description,
  eyebrow,
  title,
  tools,
  ...props
}: PageHeaderProps) {
  return (
    <header className={styles.root} {...props}>
      <div className={styles.topRow}>
        <div className={styles.identity}>
          {breadcrumbs ? (
            <div className={styles.breadcrumbs}>{breadcrumbs}</div>
          ) : null}
          {eyebrow ? <div className={styles.eyebrow}>{eyebrow}</div> : null}
          <h1 className={styles.title}>{title}</h1>
          {description ? (
            <div className={styles.description}>{description}</div>
          ) : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
      {tools ? <div className={styles.tools}>{tools}</div> : null}
    </header>
  );
}
