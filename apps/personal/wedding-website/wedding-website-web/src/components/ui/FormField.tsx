import { useId, type ReactNode } from "react";

import { classNames } from "./classNames";

type FormFieldControlProps = {
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  id: string;
  required?: boolean;
};

type FormFieldProps = {
  children: (controlProps: FormFieldControlProps) => ReactNode;
  className?: string;
  description?: ReactNode;
  error?: ReactNode;
  id?: string;
  label: ReactNode;
  required?: boolean;
};

function FormField({
  children,
  className,
  description,
  error,
  id,
  label,
  required = false
}: FormFieldProps) {
  const generatedId = useId();
  const controlId = id ?? `form-field-${generatedId.replaceAll(":", "")}`;
  const descriptionId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ");

  return (
    <div className={classNames("ui-form-field", className)}>
      <div className="ui-form-field__label-row">
        <label className="ui-form-field__label" htmlFor={controlId}>
          {label}
        </label>
        {required ? (
          <span className="ui-form-field__required">Required</span>
        ) : null}
      </div>
      {children({
        id: controlId,
        "aria-describedby": describedBy || undefined,
        "aria-invalid": error ? true : undefined,
        required: required || undefined
      })}
      {description ? (
        <p className="ui-form-field__description" id={descriptionId}>
          {description}
        </p>
      ) : null}
      {error ? (
        <p className="ui-form-field__error" id={errorId}>
          <span>Error: </span>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { FormField, type FormFieldControlProps, type FormFieldProps };
