import type { ReactNode } from "react";

import styles from "./FormField.module.scss";

export type FormFieldContentProps = {
  label?: ReactNode;
  description?: ReactNode;
};

export type FormFieldProps = FormFieldContentProps & {
  children: ReactNode;
  error?: string;
  id?: string;
  isFieldset?: boolean;
};

export function FormField({
  children,
  description,
  error,
  id,
  isFieldset = false,
  label
}: FormFieldProps) {
  if (isFieldset) {
    return (
      <fieldset className={styles.root} data-invalid={!!error || undefined}>
        {label ? <legend className={styles.label}>{label}</legend> : null}

        {children}

        {description ? (
          <div className={styles.description}>{description}</div>
        ) : null}

        {error ? <div className={styles.error}>{error}</div> : null}
      </fieldset>
    );
  }

  return (
    <div className={styles.root} data-invalid={!!error || undefined}>
      {label ? <label className={styles.label} htmlFor={id}>{label}</label> : null}

      {children}

      {description ? (
        <div className={styles.description}>{description}</div>
      ) : null}

      {error ? <div className={styles.error}>{error}</div> : null}
    </div>
  );
}
