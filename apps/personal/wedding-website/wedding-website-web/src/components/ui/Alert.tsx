import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { classNames } from "./classNames";

type AlertProps = Omit<ComponentPropsWithoutRef<"div">, "title"> & {
  children: ReactNode;
  title: ReactNode;
};

function Alert({
  children,
  className,
  role = "alert",
  title,
  ...props
}: AlertProps) {
  return (
    <div {...props} className={classNames("ui-alert", className)} role={role}>
      <svg
        aria-hidden="true"
        className="ui-alert__icon"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" />
        <path
          d="m9 9 6 6m0-6-6 6"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2.5"
        />
      </svg>
      <div className="ui-alert__copy">
        <p className="ui-alert__title">{title}</p>
        <div className="ui-alert__message">{children}</div>
      </div>
    </div>
  );
}

export { Alert, type AlertProps };
