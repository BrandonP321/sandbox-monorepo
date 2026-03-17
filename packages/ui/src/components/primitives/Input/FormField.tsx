import type { ReactNode } from "react";

export type FormFieldContentProps = {
  label?: ReactNode;
  description?: ReactNode;
};

export type FormFieldProps = FormFieldContentProps & {
  children: ReactNode;
  error?: string;
  id: string;
};

export function FormField({
  children,
  description,
  error,
  id,
  label
}: FormFieldProps) {
  return (
    <div className="ui-form-field" data-invalid={!!error || undefined}>
      {label ? (
        <label className="ui-form-field-label" htmlFor={id}>
          {label}
        </label>
      ) : null}

      {children}

      {description ? (
        <div className="ui-form-field-description">{description}</div>
      ) : null}

      {error ? <div className="ui-form-field-error">{error}</div> : null}
    </div>
  );
}
